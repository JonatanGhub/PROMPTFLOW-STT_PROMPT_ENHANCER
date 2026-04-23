# Architecture — PromptFlow STT

## 1. Overview

PromptFlow STT is a cross-platform desktop overlay application (Windows, macOS, Linux) that intercepts text from the system clipboard or a microphone dictation session, enhances it through a configurable AI provider, and returns the result to the clipboard in under 300 milliseconds of application processing time (excluding external API latency). The application targets knowledge workers who write prompts, emails, code comments, and structured documents and want AI-assisted enhancement without switching away from their current application.

Tauri v2 is the foundational framework that makes this architecture possible. It bundles a Chromium WebView (the React/TypeScript UI) alongside a native Rust process connected by a bidirectional IPC bridge. The WebView handles all rendering and user interaction while the Rust process holds OS-level privileges: it captures audio via platform microphone APIs, reads and writes the system clipboard atomically, registers global hotkeys that fire even when the application window is not focused, and stores API keys in the OS keychain. This split keeps the binary small (approximately 15 MB on disk, under 60 MB RAM at runtime) and avoids the overhead of an Electron or Node.js host process. The Rust backend communicates with the frontend through two IPC mechanisms: request/response `invoke()` calls (Promise-based on the frontend, async on the Rust side) for interactions such as clipboard reads, enhancement requests, and settings; and asynchronous Tauri events for streaming interactions (STT transcript chunks emitted in real time). All external API calls — to AI providers and STT engines — originate from the Rust process, keeping API keys out of the WebView context entirely.

## 2. Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  React / TypeScript Frontend  (Tauri WebView)                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   overlay/   │  │  settings/   │  │   onboarding/      │   │
│  │  (floating   │  │  (API keys,  │  │  (3-step wizard)   │   │
│  │   window)    │  │   hotkeys)   │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│                                                                 │
│  Zustand stores · TanStack Query mutations · typed tauri.ts     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                      Tauri IPC Bridge
                             │
              ┌──────────────┴──────────────┐
              │  invoke()  request/response  │  ← enhance_text, clipboard,
              │  emit/listen  streaming      │     settings, hotkeys
              │  (stt://chunk, stt://done)   │  ← STT transcript events
              └──────────────┬──────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Rust Backend  (src-tauri/src/)                                 │
│                                                                 │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐  │
│  │ commands/  │  │  audio/  │  │enhancement/ │  │providers/│  │
│  │  (IPC      │  │ capture  │  │  12 modes   │  │  8 AI    │  │
│  │  surface)  │  │  + vad   │  │             │  │  backends│  │
│  └────────────┘  └──────────┘  └─────────────┘  └──────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   stt/   │  │ storage/ │  │ hotkeys/ │  │  clipboard/   │  │
│  │ 6 engine │  │  db.rs + │  │ manager  │  │   manager     │  │
│  │ adapters │  │ keychain │  │          │  │               │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                                                                 │
│  error/ · permissions/ · updater/ · telemetry/ · cost/         │
└───────────────┬──────────────┬───────────────┬─────────────────┘
                │              │               │
     ┌──────────▼──┐   ┌───────▼──────┐  ┌────▼─────────────────┐
     │ OS Keychain │   │  SQLite DB   │  │  AI / STT APIs       │
     │  (keyring)  │   │ (rusqlite)   │  │  (OpenAI, Anthropic, │
     │  API keys   │   │  usage log   │  │   Deepgram, etc.)    │
     └─────────────┘   └──────────────┘  └──────────────────────┘
```

## 3. Frontend Modules (`src/`)

### 3.1 `components/`

- `overlay/` — Main floating window. Contains: `OverlayWindow.tsx` (root, manages window visibility and keyboard focus), `ModeSelector.tsx` (renders the 12 enhancement modes as a segmented control), `TextInput.tsx` (displays and allows editing of the input text pulled from clipboard or STT), `TextOutput.tsx` (shows the AI-enhanced result with diff highlighting), `ActionBar.tsx` (copy/paste/clear buttons that write back to the clipboard via Tauri commands).

- `settings/` — Settings panel rendered as a slide-over or dedicated window. Contains: `SettingsPanel.tsx` (root layout and navigation), `APIKeysForm.tsx` (per-provider key inputs with masked display; keys are never stored in the frontend state — sent directly to Rust keychain on save), `HotkeyPicker.tsx` (captures keyboard combos and validates against system conflicts), `ProviderSelector.tsx` (dropdown for AI provider and STT engine), `PrivacyToggle.tsx` (disables usage logging to SQLite and opt-in telemetry).

- `onboarding/` — First-run wizard displayed when no provider key is configured. Contains: `OnboardingWizard.tsx` (multi-step shell with progress indicator), `Step1Provider.tsx` (provider selection and API key entry with a "test connection" action), `Step2Hotkey.tsx` (global hotkey picker with live conflict detection), `Step3Test.tsx` (live enhancement test using the just-configured provider so the user validates the setup before closing).

- `ui/` — shadcn/ui component re-exports and any custom primitives (e.g., a `StatusDot` for recording state, a `CostBadge` for per-request token cost display).

### 3.2 `hooks/`

- `useEnhancement(text, mode, provider)` — triggers the `enhance_text` Tauri command via `useEnhanceMutation`, returns `{ result, isLoading, error }`. Reads the active provider and mode from `settingsStore` if not passed explicitly.

- `useSTT(engine)` — manages the full recording lifecycle. On start it calls `invoke('start_recording', {engine})`, then subscribes to `stt://chunk` events to update `sessionStore.inputText` incrementally, and subscribes to `stt://done` to finalize the transcript and stop the recording indicator. Exposes `{ isRecording, start, stop }`.

- `useHotkeys(onEnhance: () => void, onDictate: () => void)` — on mount: (1) calls `register_hotkey` for each configured binding, (2) subscribes to `hotkey://enhance` and `hotkey://dictate` Tauri events via `listen()`. On unmount: unregisters hotkeys and removes event listeners. Note: `tauri-plugin-global-shortcut` fires to the Rust callback, which then emits these frontend events. The hook does NOT receive OS hotkey events directly.

### 3.3 `stores/` (Zustand)

- `settingsStore` — persists to `localStorage` (non-sensitive values only). Shape: `{ provider: AIProvider, hasApiKey: Record<AIProvider, boolean>, selectedMode: EnhancementMode, hotkey_enhance: string, hotkey_dictate: string, privacyMode: boolean, sttEngine: STTEngine }`. API keys are never stored in the frontend. The store only tracks whether a key has been saved to the OS keychain. The `APIKeysForm` shows a masked indicator (e.g. '●●●●●●') if `hasApiKey[provider]` is true.

- `sessionStore` — ephemeral (cleared on window hide). Shape: `{ inputText: string, outputText: string, activeMode: EnhancementMode, isRecording: boolean }`.

- `uiStore` — ephemeral display state. Shape: `{ overlayVisible: boolean, isLoading: boolean, errorMessage: string | null }`.

### 3.4 `queries/` (TanStack Query)

- `useEnhanceMutation` — wraps `invoke('enhance_text', { text, mode, provider })`. On success writes `result` to `sessionStore.outputText` and calls `write_clipboard`. On error sets `uiStore.errorMessage`.

- `useSTTStatus` — a query (not mutation) that calls a lightweight Rust command to check whether the configured STT engine is reachable and its API key is valid. Used in the settings panel and onboarding to show a green/red status indicator without the user needing to attempt a full recording.

### 3.5 `lib/`

- `tauri.ts` — exports one typed async function per Tauri command. No component or hook is permitted to call `invoke()` with a raw string directly; all calls must go through this module. This is the single source of truth for the IPC surface from the TypeScript side and makes refactoring command names a one-file change.

- `utils.ts` — `cn()` (Tailwind class merger via `clsx` + `tailwind-merge`), `truncate(text, maxLen)`, `formatCost(usd: number): string` (formats sub-cent costs as `< $0.01`).

### 3.6 `types/index.ts`

Defines all shared TypeScript interfaces:

```typescript
type EnhancementMode =
  | 'fix_grammar' | 'formalize' | 'shorten' | 'expand'
  | 'translate' | 'brainstorm' | 'action_items' | 'summarize'
  | 'code_review' | 'simplify' | 'reframe' | 'custom'

type STTEngine =
  | 'whisper_api' | 'whisper_cpp' | 'deepgram'
  | 'assembly_ai' | 'google_stt' | 'azure_stt' | 'web_speech'

type AIProvider =
  | 'openai' | 'anthropic' | 'gemini' | 'ollama'
  | 'groq' | 'mistral' | 'openrouter' | 'custom'

interface EnhanceRequest { text: string; mode: EnhancementMode; provider: AIProvider }
interface EnhanceResponse { result: string; tokens_used: number; cost_usd: number }
interface AppError { code: string; message: string }
interface STTStatus { available: boolean; reason?: string }
```

## 4. Backend Modules (`src-tauri/src/`)

### 4.1 `commands/` — IPC surface

All public Tauri commands are annotated `#[tauri::command]` and registered in `lib.rs`. Every command returns `Result<T, AppError>` — errors are serialized by `thiserror` + `serde` and arrive in the frontend as a typed `AppError` object rather than an opaque string.

- `enhance_text(text: String, mode: String, provider: String) -> Result<EnhanceResponse, AppError>` — validates mode/provider, calls `enhancement::build_prompt`, dispatches to the correct `providers::` implementation, logs usage to SQLite.
- `start_recording(engine: String) -> Result<(), AppError>` — acquires the microphone, spawns the audio capture task, begins streaming chunks to the STT engine.
- `stop_recording() -> Result<String, AppError>` — signals the capture task to flush, waits for the final transcript, returns it.
- `get_settings() -> Result<Settings, AppError>` — reads persisted settings from a JSON file in the Tauri app data directory (non-secret fields only).
- `set_settings(settings: Settings) -> Result<(), AppError>` — writes settings to the app data directory.
- `register_hotkey(id: String, shortcut: String) -> Result<(), AppError>` — delegates to `tauri-plugin-global-shortcut`.
- `unregister_hotkey(id: String) -> Result<(), AppError>` — removes a previously registered global shortcut.
- `read_clipboard() -> Result<String, AppError>` — reads the current clipboard text.
- `write_clipboard(text: String) -> Result<(), AppError>` — writes text to the clipboard.
- `check_stt_status(engine: String) -> Result<STTStatus, AppError>` — checks if engine is reachable and API key is valid.

### 4.2 `error/mod.rs`

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Provider error: {0}")] Provider(String),
    #[error("STT error: {0}")] Stt(String),
    #[error("Storage error: {0}")] Storage(String),
    #[error("Permission denied: {0}")] Permission(String),
    #[error("Clipboard error: {0}")] Clipboard(String),
    #[error("Hotkey error: {0}")] Hotkey(String),
}

// Custom Serialize to produce { "code": "...", "message": "..." }
// required for Tauri IPC — derived Serialize produces {"Provider":"..."} instead
impl serde::Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeMap;
        let mut map = s.serialize_map(Some(2))?;
        map.serialize_entry("code", match self {
            AppError::Provider(_) => "Provider",
            AppError::Stt(_) => "Stt",
            AppError::Storage(_) => "Storage",
            AppError::Permission(_) => "Permission",
            AppError::Clipboard(_) => "Clipboard",
            AppError::Hotkey(_) => "Hotkey",
        })?;
        map.serialize_entry("message", &self.to_string())?;
        map.end()
    }
}
```

`AppError` uses a custom `serde::Serialize` implementation (not derived) so that Tauri's IPC layer serializes it as `{ "code": "...", "message": "..." }`. Derived `Serialize` on an enum would produce `{"Provider":"..."}` instead, which does not match the `AppError` TypeScript interface. Frontend code deserializes the serialized form into the `AppError` TypeScript interface.

### 4.3 `stt/mod.rs` — STTEngine trait

```rust
#[async_trait]
pub trait STTEngine: Send + Sync {
    async fn transcribe(&self, audio: Vec<f32>, sample_rate: u32) -> Result<String, AppError>;
    fn engine_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
```

Implementations live in `stt/engines/`: `whisper_api.rs` (OpenAI Whisper via HTTP), `whisper_cpp.rs` (local binary via `std::process::Command`), `deepgram.rs`, `assembly_ai.rs`, `google_stt.rs`, `azure_stt.rs`. The `web_speech` engine is frontend-only and uses the browser's Web Speech API inside the WebView — no Rust module is needed for it.

### 4.4 `providers/mod.rs` — AIProvider trait

```rust
#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError>;
    fn provider_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}

pub struct ProviderResponse {
    pub text: String,
    pub tokens_used: u32,
    pub cost_usd: f64,
}
```

Implementations: `openai.rs`, `anthropic.rs`, `gemini.rs`, `ollama.rs` (local, no key required), `groq.rs`, `mistral.rs`, `openrouter.rs`, `custom.rs` (arbitrary base URL + key). Each implementation handles its own HTTP client, retry logic, and token/cost accounting specific to that provider's pricing model.

### 4.5 `enhancement/mod.rs`

Holds the `EnhancementMode` enum and a dispatch function:

```rust
/// Returns (system_prompt, user_message) tuple
pub fn build_prompt(mode: &EnhancementMode, text: &str) -> (String, String)
```

Each mode corresponds to a pure function in its own file (e.g., `fix_grammar.rs`, `formalize.rs`) that constructs a system prompt and user message from the input text. This separation keeps prompts easy to audit, update, and test without touching the dispatch logic.

### 4.6 `storage/`

- `db.rs` — manages a SQLite database via `rusqlite`. The primary table is:

  ```sql
  CREATE TABLE usage_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp  TEXT    NOT NULL,
      mode       TEXT    NOT NULL,
      provider   TEXT    NOT NULL,
      tokens     INTEGER NOT NULL,
      cost_usd   REAL    NOT NULL,
      input_len  INTEGER NOT NULL,
      output_len INTEGER NOT NULL
  );
  ```

  Writes are fire-and-forget (spawned as a background task) to avoid adding latency to the user-facing path.

- `keychain.rs` — stores and retrieves API keys using the `keyring` crate, which delegates to the OS credential store (Windows Credential Manager, macOS Keychain, libsecret on Linux). Key format: `promptflow-stt/<provider>` (e.g., `promptflow-stt/openai`). Keys are never written to disk in plaintext and never sent to the frontend — the frontend only receives a boolean indicating whether a key is present.

### 4.7 `audio/`

- `capture.rs` — opens the default input device using `cpal`, configures it for 16 kHz mono PCM (the sample rate required by Whisper-family models), and writes `Vec<f32>` chunks to an async channel consumed by the STT engine. Gracefully handles device enumeration failures and surfaces them as `AppError::Permission`.

- `vad.rs` — implements simple energy-based Voice Activity Detection. It computes RMS energy on each audio chunk and triggers a silence detection event after 1.5 seconds of audio below a configurable threshold (default: −40 dBFS). This signals the STT engine to flush the final transcript without requiring the user to press a stop button.

## 5. IPC Contract

### Invoke (request/response)

| Command | Frontend call | Rust handler | Returns |
|---|---|---|---|
| enhance_text | `invoke('enhance_text', {text, mode, provider})` | `commands::enhance::enhance_text` | `EnhanceResponse` |
| start_recording | `invoke('start_recording', {engine})` | `commands::stt::start_recording` | `()` |
| stop_recording | `invoke('stop_recording')` | `commands::stt::stop_recording` | `String` |
| get_settings | `invoke('get_settings')` | `commands::settings::get_settings` | `Settings` |
| set_settings | `invoke('set_settings', {settings})` | `commands::settings::set_settings` | `()` |
| register_hotkey | `invoke('register_hotkey', {id, shortcut})` | `commands::hotkeys::register_hotkey` | `()` |
| unregister_hotkey | `invoke('unregister_hotkey', {id})` | `commands::hotkeys::unregister_hotkey` | `()` |
| read_clipboard | `invoke('read_clipboard')` | `commands::clipboard::read_clipboard` | `String` |
| write_clipboard | `invoke('write_clipboard', {text})` | `commands::clipboard::write_clipboard` | `()` |
| check_stt_status | `invoke('check_stt_status', {engine})` | `commands::stt::check_stt_status` | `STTStatus` |

All commands are typed via `lib/tauri.ts`. No component calls `invoke()` with a raw string.

### Events (streaming — Tauri emit/listen)

| Event | Direction | Payload |
|---|---|---|
| `stt://chunk` | Rust → Frontend | `{ text: string }` — partial transcript emitted as audio is processed |
| `stt://done` | Rust → Frontend | `{ text: string }` — final consolidated transcript; signals recording completion |
| `hotkey://enhance` | Rust → Frontend | `{}` — fired when enhance hotkey pressed |
| `hotkey://dictate` | Rust → Frontend | `{}` — fired when dictate hotkey pressed |

## 6. `tauri.conf.json` Decisions

- `identifier`: `com.clawd.promptflow-stt`
- `productName`: `PromptFlow STT`
- Window: `decorations: false` (no native title bar — the overlay renders its own chrome), `alwaysOnTop: true` (stays above the user's active application), `transparent: true` (allows rounded-corner blur effect), `resizable: false`, `width: 480`, `height: 320`
- Enabled plugins: `global-shortcut` (system-wide hotkey registration), `clipboard-manager` (atomic clipboard read/write), `updater` (background auto-update with user-visible changelog)
- Permissions granted in `capabilities/default.json`:
  - `clipboard-manager:allow-read-text`
  - `clipboard-manager:allow-write-text`
  - `global-shortcut:allow-register`
  - `global-shortcut:allow-unregister`
  - `global-shortcut:allow-is-registered`
  - `core:default`
  - Note: `shell:open` is NOT included — whisper.cpp binary execution will be handled via a dedicated Tauri shell plugin permission when that feature is implemented in v0.5.

## 7. Data Flow — Enhancement (happy path)

1. User presses hotkey → Rust global-shortcut callback fires → Rust emits `hotkey://enhance` event → frontend `useHotkeys` listener calls `read_clipboard`.
2. `read_clipboard` is called via `lib/tauri.ts`. The current clipboard text becomes the input.
3. `useEnhanceMutation` calls `invoke('enhance_text', { text, mode, provider })` where `mode` is the current `settingsStore.selectedMode` and `provider` is `settingsStore.provider`.
4. Rust: `commands::enhance::enhance_text` calls `enhancement::build_prompt(mode)` to produce a `(system, user)` prompt pair, then dispatches to the matching `providers::<provider>::complete(system, user)`.
5. Rust: the provider returns a `ProviderResponse`. The command calls `storage::db::log_usage()` as a background task (non-blocking), then serializes and returns `EnhanceResponse` to the frontend.
6. The frontend receives the result. `useEnhanceMutation.onSuccess` calls `write_clipboard(result)` so the enhanced text is immediately available for the user to paste. The overlay window becomes visible showing the before/after diff.
7. Total processing time target (excluding AI API network latency): under 300 ms. The clipboard write completes before the overlay animation finishes, so the user can paste immediately.

## 8. Data Flow — STT (happy path)

1. User holds the configured dictation hotkey. The `useSTT` hook calls `invoke('start_recording', { engine })`.
2. Rust: `audio::capture` opens the default microphone via `cpal` and begins collecting 16 kHz mono audio. `audio::vad` monitors RMS energy on each chunk in parallel.
3. Audio chunks are fed to the configured `stt::engines::<engine>` implementation. For streaming-capable engines (Deepgram, AssemblyAI), partial transcripts are emitted to the frontend as `stt://chunk` Tauri events.
4. The frontend `useSTT` hook listens for `stt://chunk` and appends partial text to `sessionStore.inputText`, giving the user real-time visual feedback of what is being transcribed.
5. `audio::vad` detects that audio energy has been below the silence threshold for 1.5 seconds. It signals the capture task to stop and sends the accumulated audio to the STT engine for final processing.
6. The STT engine returns its final transcript. Rust emits `stt://done` with the complete text.
7. The frontend `useSTT` hook receives `stt://done`, writes the final transcript to `sessionStore.inputText`, and clears the `isRecording` flag. The user can then review the transcription and trigger enhancement if desired.
