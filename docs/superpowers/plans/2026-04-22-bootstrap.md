# PromptFlow STT — Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the bootstrap phase — Tauri v2 project scaffold + 13 production-ready spec documents.

**Architecture:** Architecture spec written first → scaffold built from it → `PROJECT_STRUCTURE` spec documents the result → remaining 11 specs written in sequence. All work stays on branch `bootstrap/initial-setup`.

**Tech Stack:** Tauri v2 · Rust stable · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · TanStack Query · Vite · SQLite · OS Keychain

**Design doc:** `docs/superpowers/specs/2026-04-22-promptflow-stt-design.md`

---

## File Map (all files created or modified in this plan)

### Spec documents
- `docs/specs/01_PRD.md`
- `docs/specs/02_COMPETITIVE_ANALYSIS.md`
- `docs/specs/03_ARCHITECTURE.md`
- `docs/specs/04_FEATURES.md`
- `docs/specs/05_UI_UX.md`
- `docs/specs/06_AI_INTEGRATIONS.md`
- `docs/specs/07_ROADMAP.md`
- `docs/specs/08_PROJECT_STRUCTURE.md`
- `docs/specs/09_CODING_GUIDELINES.md`
- `docs/PRIVACY.md`
- `docs/THREAT_MODEL.md`
- `docs/PERFORMANCE.md`
- `docs/RELEASE.md`

### Scaffold — root config
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `.nvmrc`
- `.env.example`
- `tailwind.config.ts`
- `components.json`
- `.gitignore` (update)

### Scaffold — frontend source
- `src/main.tsx`
- `src/App.tsx`
- `src/types/index.ts`
- `src/lib/tauri.ts`
- `src/lib/utils.ts`
- `src/stores/settingsStore.ts`
- `src/stores/sessionStore.ts`
- `src/stores/uiStore.ts`
- `src/queries/enhancementQueries.ts`
- `src/queries/sttQueries.ts`
- `src/hooks/useEnhancement.ts`
- `src/hooks/useSTT.ts`
- `src/hooks/useHotkeys.ts`
- `src/components/overlay/.gitkeep`
- `src/components/settings/.gitkeep`
- `src/components/onboarding/.gitkeep`
- `src/components/ui/.gitkeep`

### Scaffold — Rust backend
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/error/mod.rs`
- `src-tauri/src/commands/enhance.rs`
- `src-tauri/src/commands/stt.rs`
- `src-tauri/src/commands/settings.rs`
- `src-tauri/src/commands/hotkeys.rs`
- `src-tauri/src/commands/clipboard.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/audio/capture.rs`
- `src-tauri/src/audio/vad.rs`
- `src-tauri/src/audio/mod.rs`
- `src-tauri/src/stt/mod.rs`
- `src-tauri/src/stt/engines/mod.rs`
- `src-tauri/src/stt/engines/whisper_api.rs`
- `src-tauri/src/stt/engines/whisper_cpp.rs`
- `src-tauri/src/stt/engines/deepgram.rs`
- `src-tauri/src/stt/engines/assembly_ai.rs`
- `src-tauri/src/stt/engines/google_stt.rs`
- `src-tauri/src/stt/engines/azure_stt.rs`
- `src-tauri/src/enhancement/mod.rs`
- `src-tauri/src/providers/mod.rs`
- `src-tauri/src/hotkeys/manager.rs`
- `src-tauri/src/hotkeys/mod.rs`
- `src-tauri/src/clipboard/manager.rs`
- `src-tauri/src/clipboard/mod.rs`
- `src-tauri/src/storage/db.rs`
- `src-tauri/src/storage/keychain.rs`
- `src-tauri/src/storage/mod.rs`
- `src-tauri/src/permissions/checker.rs`
- `src-tauri/src/permissions/mod.rs`
- `src-tauri/src/updater/manager.rs`
- `src-tauri/src/updater/mod.rs`
- `src-tauri/src/telemetry/events.rs`
- `src-tauri/src/telemetry/mod.rs`
- `src-tauri/src/cost/tracker.rs`
- `src-tauri/src/cost/mod.rs`

### CI
- `.github/workflows/ci.yml`
- `.github/workflows/security.yml`

---

## Task 1: Write `docs/specs/03_ARCHITECTURE.md`

**Files:**
- Create: `docs/specs/03_ARCHITECTURE.md`

- [ ] **Step 1: Create `docs/specs/` directory**

```bash
mkdir -p docs/specs
```

- [ ] **Step 2: Write `03_ARCHITECTURE.md`**

Write the file with ALL of the following sections (no TBDs, no placeholders):

```markdown
# Architecture — PromptFlow STT

## 1. Overview
[2-paragraph description of the system: what it is, how Tauri v2 enables it, why Rust backend + React frontend]

## 2. Layer Diagram
[ASCII diagram matching the one in the design doc — Frontend WebView / Tauri IPC / Rust Backend / OS Keychain + SQLite + APIs]

## 3. Frontend Modules (`src/`)

### 3.1 `components/`
- `overlay/` — Main floating window. Contains: `OverlayWindow.tsx` (root), `ModeSelector.tsx` (12 enhancement modes), `TextInput.tsx`, `TextOutput.tsx`, `ActionBar.tsx` (copy/paste/clear buttons)
- `settings/` — Settings panel. Contains: `SettingsPanel.tsx`, `APIKeysForm.tsx`, `HotkeyPicker.tsx`, `ProviderSelector.tsx`, `PrivacyToggle.tsx`
- `onboarding/` — First-run wizard (3 steps). Contains: `OnboardingWizard.tsx`, `Step1Provider.tsx`, `Step2Hotkey.tsx`, `Step3Test.tsx`
- `ui/` — shadcn/ui re-exports and custom primitives

### 3.2 `hooks/`
- `useEnhancement(text, mode, provider)` → triggers `enhance_text` command, returns `{ result, isLoading, error }`
- `useSTT(engine)` → manages recording state, emits start/stop to Rust, receives transcript via Tauri events `stt://chunk` and `stt://done`
- `useHotkeys()` → reads hotkeys from settingsStore, registers them on mount via `register_hotkey` command

### 3.3 `stores/` (Zustand)
- `settingsStore` — persists to localStorage: `{ provider, apiKeys, selectedMode, hotkeys, privacyMode, sttEngine }`
- `sessionStore` — ephemeral: `{ inputText, outputText, activeMode, isRecording }`
- `uiStore` — ephemeral: `{ overlayVisible, isLoading, errorMessage }`

### 3.4 `queries/` (TanStack Query)
- `useEnhanceMutation` — wraps `invoke('enhance_text', { text, mode, provider })`, invalidates session on success
- `useSTTStatus` — query for checking STT engine availability

### 3.5 `lib/`
- `tauri.ts` — typed wrappers for all `invoke()` calls. No component should call `invoke()` directly with a raw string.
- `utils.ts` — `cn()` (Tailwind class merger), `truncate()`, `formatCost()`

### 3.6 `types/index.ts`
Defines all shared TypeScript interfaces:
```typescript
type EnhancementMode = 'fix_grammar' | 'formalize' | 'shorten' | 'expand' | 'translate' | 'brainstorm' | 'action_items' | 'summarize' | 'code_review' | 'simplify' | 'reframe' | 'custom'
type STTEngine = 'whisper_api' | 'whisper_cpp' | 'deepgram' | 'assembly_ai' | 'google_stt' | 'azure_stt' | 'web_speech'
type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'groq' | 'mistral' | 'openrouter' | 'custom'
interface EnhanceRequest { text: string; mode: EnhancementMode; provider: AIProvider }
interface EnhanceResponse { result: string; tokens_used: number; cost_usd: number }
interface AppError { code: string; message: string }
```

## 4. Backend Modules (`src-tauri/src/`)

### 4.1 `commands/` — IPC surface
All `#[tauri::command]` functions. Return type is always `Result<T, AppError>`.
- `enhance_text(text: String, mode: String, provider: String) -> Result<EnhanceResponse, AppError>`
- `start_recording(engine: String) -> Result<(), AppError>`
- `stop_recording() -> Result<String, AppError>` — returns final transcript
- `get_settings() -> Result<Settings, AppError>`
- `set_settings(settings: Settings) -> Result<(), AppError>`
- `register_hotkey(id: String, shortcut: String) -> Result<(), AppError>`
- `unregister_hotkey(id: String) -> Result<(), AppError>`
- `read_clipboard() -> Result<String, AppError>`
- `write_clipboard(text: String) -> Result<(), AppError>`

### 4.2 `error/mod.rs`
```rust
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("Provider error: {0}")] Provider(String),
    #[error("STT error: {0}")] Stt(String),
    #[error("Storage error: {0}")] Storage(String),
    #[error("Permission denied: {0}")] Permission(String),
    #[error("Clipboard error: {0}")] Clipboard(String),
    #[error("Hotkey error: {0}")] Hotkey(String),
}
```

### 4.3 `stt/mod.rs` — STTEngine trait
```rust
#[async_trait]
pub trait STTEngine: Send + Sync {
    async fn transcribe(&self, audio: Vec<f32>, sample_rate: u32) -> Result<String, AppError>;
    fn engine_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
```

### 4.4 `providers/mod.rs` — AIProvider trait
```rust
#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError>;
    fn provider_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
pub struct ProviderResponse { pub text: String, pub tokens_used: u32, pub cost_usd: f64 }
```

### 4.5 `enhancement/mod.rs`
Dispatches to the correct system prompt per mode. Each mode is a pure function `build_prompt(text: &str) -> (system: String, user: String)`.

### 4.6 `storage/`
- `db.rs` — SQLite via `rusqlite`. Table: `usage_log (id, timestamp, mode, provider, tokens, cost_usd, input_len, output_len)`
- `keychain.rs` — stores/retrieves API keys using `keyring` crate. Key format: `promptflow-stt/<provider>`

### 4.7 `audio/`
- `capture.rs` — microphone capture via `cpal`. Outputs `Vec<f32>` at 16kHz (required by Whisper).
- `vad.rs` — simple energy-based Voice Activity Detection: stop recording after 1.5s of silence below threshold.

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
| read_clipboard | `invoke('read_clipboard')` | `commands::clipboard::read_clipboard` | `String` |
| write_clipboard | `invoke('write_clipboard', {text})` | `commands::clipboard::write_clipboard` | `()` |

### Events (streaming — Tauri emit/listen)
| Event | Direction | Payload |
|---|---|---|
| `stt://chunk` | Rust → Frontend | `{ text: string }` — partial transcript |
| `stt://done` | Rust → Frontend | `{ text: string }` — final transcript |

## 6. `tauri.conf.json` Decisions
- `identifier`: `com.clawd.promptflow-stt`
- `productName`: `PromptFlow STT`
- Window: `decorations: false`, `alwaysOnTop: true`, `transparent: true`, `resizable: false`, `width: 480`, `height: 320`
- Plugins: `global-shortcut`, `clipboard-manager`, `updater`

## 7. Data Flow — Enhancement (happy path)
1. User presses hotkey → frontend receives OS event via `tauri-plugin-global-shortcut`
2. `useHotkeys` hook calls `read_clipboard` → gets input text
3. `useEnhanceMutation` calls `invoke('enhance_text', {text, mode, provider})`
4. Rust: `commands::enhance::enhance_text` → `enhancement::build_prompt(mode)` → `providers::<provider>::complete(system, user)`
5. Rust: response + cost logged to SQLite via `storage::db`
6. Result returned to frontend → written to clipboard via `write_clipboard`
7. Total time target: < 300 ms (excluding AI API latency)

## 8. Data Flow — STT (happy path)
1. User holds hotkey → `invoke('start_recording', {engine})`
2. Rust: `audio::capture` starts mic → `audio::vad` monitors silence
3. Audio chunks streamed to `stt::engines::<engine>::transcribe`
4. Partial transcripts emitted as `stt://chunk` events
5. VAD detects silence → recording stops → final transcript emitted as `stt://done`
6. Frontend receives transcript in `sessionStore.inputText`
```

- [ ] **Step 3: Verify no placeholders**

```bash
grep -i "TBD\|TODO\|placeholder\|fill in\|coming soon" docs/specs/03_ARCHITECTURE.md
```

Expected: no output (zero matches).

- [ ] **Step 4: Commit**

```bash
git add docs/specs/03_ARCHITECTURE.md
git commit -m "docs(specs): add architecture spec"
```

---

## Task 2: Scaffold — Root config files

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.nvmrc`, `.gitignore` (update)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "promptflow-stt",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-global-shortcut": "^2",
    "@tauri-apps/plugin-clipboard-manager": "^2",
    "@tauri-apps/plugin-updater": "^2",
    "@tanstack/react-query": "^5",
    "zustand": "^5",
    "react": "^18",
    "react-dom": "^18",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@typescript-eslint/eslint-plugin": "^7",
    "@typescript-eslint/parser": "^7",
    "@vitejs/plugin-react": "^4",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-plugin-react-hooks": "^4",
    "tailwindcss": "^3",
    "typescript": "^5",
    "vite": "^5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/brand/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PromptFlow STT</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `.nvmrc`**

```
20
```

- [ ] **Step 7: Update `.gitignore`**

Add to existing `.gitignore` (or create if absent):

```gitignore
# Node
node_modules/
dist/

# Tauri
src-tauri/target/
src-tauri/WixTools/
*.dmg
*.AppImage
*.deb
*.msi
*.exe

# Env
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html .nvmrc .gitignore
git commit -m "chore: add scaffold root config files"
```

---

## Task 3: Scaffold — Tailwind + shadcn/ui config

**Files:**
- Create: `tailwind.config.ts`, `components.json`, `src/index.css`

- [ ] **Step 1: Create `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Create `components.json`** (shadcn/ui config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 3: Create `src/index.css`** (CSS variables for shadcn/ui + overlay-optimized dark theme)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 263 70% 60%;
    --primary: 263 70% 60%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 263 70% 60%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }

  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts components.json src/index.css
git commit -m "chore: add Tailwind + shadcn/ui config"
```

---

## Task 4: Scaffold — Rust backend (`src-tauri/`)

**Files:** `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`

- [ ] **Step 1: Create `src-tauri/Cargo.toml`**

```toml
[package]
name = "promptflow-stt"
version = "0.0.1"
edition = "2021"

[lib]
name = "promptflow_stt_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-clipboard-manager = "2"
tauri-plugin-updater = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
thiserror = "1"
rusqlite = { version = "0.31", features = ["bundled"] }
keyring = "2"
cpal = "0.15"
reqwest = { version = "0.12", features = ["json", "stream"] }
async-trait = "0.1"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

- [ ] **Step 2: Create `src-tauri/build.rs`**

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 3: Create `src-tauri/tauri.conf.json`**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "PromptFlow STT",
  "version": "0.0.1",
  "identifier": "com.clawd.promptflow-stt",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "label": "overlay",
        "title": "PromptFlow STT",
        "width": 480,
        "height": 320,
        "resizable": false,
        "decorations": false,
        "alwaysOnTop": true,
        "transparent": true,
        "visible": false,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
```

- [ ] **Step 4: Create `src-tauri/capabilities/default.json`**

```json
{
  "$schema": "https://schema.tauri.app/v2/schema/desktop-capability.json",
  "identifier": "default",
  "description": "Default capabilities for PromptFlow STT",
  "windows": ["overlay"],
  "permissions": [
    "core:default",
    "clipboard-manager:allow-read-text",
    "clipboard-manager:allow-write-text",
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",
    "global-shortcut:allow-is-registered"
  ]
}
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/
git commit -m "chore: add Rust backend scaffold (Cargo.toml, tauri.conf.json, capabilities)"
```

---

## Task 5: Scaffold — Rust module stubs

Create all Rust modules as minimal compilable stubs. Each file declares the module structure without implementation logic — `todo!()` or `unimplemented!()` for function bodies that will be filled in future sprints.

**Files:** All `src-tauri/src/**/*.rs` files listed in the File Map.

- [ ] **Step 1: Create `src-tauri/src/error/mod.rs`**

```rust
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("Provider error: {0}")]
    Provider(String),
    #[error("STT error: {0}")]
    Stt(String),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("Permission denied: {0}")]
    Permission(String),
    #[error("Clipboard error: {0}")]
    Clipboard(String),
    #[error("Hotkey error: {0}")]
    Hotkey(String),
}
```

- [ ] **Step 2: Create `src-tauri/src/commands/mod.rs`**

```rust
pub mod clipboard;
pub mod enhance;
pub mod hotkeys;
pub mod settings;
pub mod stt;
```

- [ ] **Step 3: Create `src-tauri/src/commands/enhance.rs`**

```rust
use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EnhanceResponse {
    pub result: String,
    pub tokens_used: u32,
    pub cost_usd: f64,
}

#[tauri::command]
pub async fn enhance_text(
    text: String,
    mode: String,
    provider: String,
) -> Result<EnhanceResponse, AppError> {
    // Implementation in v0.1 sprint
    todo!("enhance_text not yet implemented")
}
```

- [ ] **Step 4: Create `src-tauri/src/commands/stt.rs`**

```rust
use crate::error::AppError;

#[tauri::command]
pub async fn start_recording(engine: String) -> Result<(), AppError> {
    todo!("start_recording not yet implemented")
}

#[tauri::command]
pub async fn stop_recording() -> Result<String, AppError> {
    todo!("stop_recording not yet implemented")
}
```

- [ ] **Step 5: Create `src-tauri/src/commands/settings.rs`**

```rust
use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub provider: String,
    pub stt_engine: String,
    pub selected_mode: String,
    pub privacy_mode: bool,
    pub hotkey_enhance: String,
    pub hotkey_dictate: String,
}

#[tauri::command]
pub async fn get_settings() -> Result<Settings, AppError> {
    todo!("get_settings not yet implemented")
}

#[tauri::command]
pub async fn set_settings(settings: Settings) -> Result<(), AppError> {
    todo!("set_settings not yet implemented")
}
```

- [ ] **Step 6: Create `src-tauri/src/commands/hotkeys.rs`**

```rust
use crate::error::AppError;

#[tauri::command]
pub async fn register_hotkey(id: String, shortcut: String) -> Result<(), AppError> {
    todo!("register_hotkey not yet implemented")
}

#[tauri::command]
pub async fn unregister_hotkey(id: String) -> Result<(), AppError> {
    todo!("unregister_hotkey not yet implemented")
}
```

- [ ] **Step 7: Create `src-tauri/src/commands/clipboard.rs`**

```rust
use crate::error::AppError;

#[tauri::command]
pub async fn read_clipboard() -> Result<String, AppError> {
    todo!("read_clipboard not yet implemented")
}

#[tauri::command]
pub async fn write_clipboard(text: String) -> Result<(), AppError> {
    todo!("write_clipboard not yet implemented")
}
```

- [ ] **Step 8: Create all remaining module stubs**

Create these files, each with just the pub mod declarations and empty structs/traits:

`src-tauri/src/audio/mod.rs`:
```rust
pub mod capture;
pub mod vad;
```

`src-tauri/src/audio/capture.rs`:
```rust
pub struct AudioCapture;
impl AudioCapture {
    pub fn new() -> Self { Self }
}
```

`src-tauri/src/audio/vad.rs`:
```rust
pub struct VoiceActivityDetector { pub silence_threshold: f32, pub silence_duration_ms: u32 }
impl VoiceActivityDetector {
    pub fn new() -> Self { Self { silence_threshold: 0.01, silence_duration_ms: 1500 } }
    pub fn is_silence(&self, chunk: &[f32]) -> bool {
        chunk.iter().map(|s| s.abs()).sum::<f32>() / chunk.len() as f32 < self.silence_threshold
    }
}
```

`src-tauri/src/stt/mod.rs`:
```rust
pub mod engines;
use crate::error::AppError;
use async_trait::async_trait;
#[async_trait]
pub trait STTEngine: Send + Sync {
    async fn transcribe(&self, audio: Vec<f32>, sample_rate: u32) -> Result<String, AppError>;
    fn engine_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
```

`src-tauri/src/stt/engines/mod.rs`:
```rust
pub mod assembly_ai;
pub mod azure_stt;
pub mod deepgram;
pub mod google_stt;
pub mod whisper_api;
pub mod whisper_cpp;
```

Each STT engine file (`whisper_api.rs`, `whisper_cpp.rs`, `deepgram.rs`, `assembly_ai.rs`, `google_stt.rs`, `azure_stt.rs`) follows the same pattern:
```rust
use crate::{error::AppError, stt::STTEngine};
use async_trait::async_trait;
pub struct WhisperApiEngine { pub api_key: String }  // rename struct per engine
#[async_trait]
impl STTEngine for WhisperApiEngine {
    async fn transcribe(&self, _audio: Vec<f32>, _sample_rate: u32) -> Result<String, AppError> {
        todo!("WhisperApiEngine::transcribe not yet implemented")
    }
    fn engine_id(&self) -> &'static str { "whisper_api" }
    fn requires_api_key(&self) -> bool { true }
}
```

`src-tauri/src/enhancement/mod.rs`:
```rust
pub enum EnhancementMode {
    FixGrammar, Formalize, Shorten, Expand, Translate,
    Brainstorm, ActionItems, Summarize, CodeReview,
    Simplify, Reframe, Custom(String),
}
pub fn build_prompt(mode: &EnhancementMode, text: &str) -> (String, String) {
    match mode {
        EnhancementMode::FixGrammar => (
            "You are a grammar correction assistant. Fix grammar and spelling errors. Return only the corrected text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Formalize => (
            "You are a writing assistant. Rewrite the text in a formal, professional tone. Return only the rewritten text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Shorten => (
            "You are a writing assistant. Shorten the text while preserving the key meaning. Return only the shortened text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Expand => (
            "You are a writing assistant. Expand the text with more detail and context. Return only the expanded text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Translate => (
            "Translate the text to English. If already in English, translate to Spanish. Return only the translation.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Brainstorm => (
            "You are a creative assistant. Generate 5 related ideas or angles based on the input. Return as a numbered list.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::ActionItems => (
            "Extract all action items from the text. Return as a markdown checklist (- [ ] item).".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Summarize => (
            "Summarize the text in 2-3 sentences. Return only the summary.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::CodeReview => (
            "Review the code for bugs, style issues, and improvements. Return a bulleted list of findings.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Simplify => (
            "Simplify the text so a non-expert can understand it. Return only the simplified text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Reframe => (
            "Reframe the text from a positive/constructive angle. Return only the reframed text.".to_string(),
            text.to_string(),
        ),
        EnhancementMode::Custom(prompt) => (prompt.clone(), text.to_string()),
    }
}
```

`src-tauri/src/providers/mod.rs`:
```rust
use crate::error::AppError;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderResponse { pub text: String, pub tokens_used: u32, pub cost_usd: f64 }
#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn complete(&self, system: &str, user: &str) -> Result<ProviderResponse, AppError>;
    fn provider_id(&self) -> &'static str;
    fn requires_api_key(&self) -> bool;
}
```

Remaining modules (hotkeys, clipboard, storage, permissions, updater, telemetry, cost) — create `mod.rs` with re-exports and stub `.rs` files:

`src-tauri/src/hotkeys/mod.rs`: `pub mod manager;`
`src-tauri/src/hotkeys/manager.rs`: `pub struct HotkeyManager;`

`src-tauri/src/clipboard/mod.rs`: `pub mod manager;`
`src-tauri/src/clipboard/manager.rs`: `pub struct ClipboardManager;`

`src-tauri/src/storage/mod.rs`: `pub mod db; pub mod keychain;`
`src-tauri/src/storage/db.rs`: `pub struct Database;`
`src-tauri/src/storage/keychain.rs`: `pub struct KeychainStore;`

`src-tauri/src/permissions/mod.rs`: `pub mod checker;`
`src-tauri/src/permissions/checker.rs`: `pub fn check_microphone_permission() -> bool { true }`

`src-tauri/src/updater/mod.rs`: `pub mod manager;`
`src-tauri/src/updater/manager.rs`: `pub struct UpdaterManager;`

`src-tauri/src/telemetry/mod.rs`: `pub mod events;`
`src-tauri/src/telemetry/events.rs`: `pub fn track(_event: &str, _enabled: bool) {}`

`src-tauri/src/cost/mod.rs`: `pub mod tracker;`
`src-tauri/src/cost/tracker.rs`: `pub fn estimate_cost(tokens: u32, provider: &str) -> f64 { 0.0 }`

- [ ] **Step 9: Create `src-tauri/src/lib.rs`**

```rust
mod audio;
mod clipboard;
mod commands;
mod cost;
mod enhancement;
mod error;
mod hotkeys;
mod permissions;
mod providers;
mod stt;
mod storage;
mod telemetry;
mod updater;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::enhance::enhance_text,
            commands::stt::start_recording,
            commands::stt::stop_recording,
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::hotkeys::register_hotkey,
            commands::hotkeys::unregister_hotkey,
            commands::clipboard::read_clipboard,
            commands::clipboard::write_clipboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 10: Create `src-tauri/src/main.rs`**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    promptflow_stt_lib::run()
}
```

- [ ] **Step 11: Commit**

```bash
git add src-tauri/src/
git commit -m "chore: add Rust module stubs (compilable, not yet implemented)"
```

---

## Task 6: Scaffold — Frontend source stubs

**Files:** All `src/**/*.ts(x)` files listed in the File Map.

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export type EnhancementMode =
  | 'fix_grammar' | 'formalize' | 'shorten' | 'expand' | 'translate'
  | 'brainstorm' | 'action_items' | 'summarize' | 'code_review'
  | 'simplify' | 'reframe' | 'custom'

export type STTEngine =
  | 'whisper_api' | 'whisper_cpp' | 'deepgram'
  | 'assembly_ai' | 'google_stt' | 'azure_stt' | 'web_speech'

export type AIProvider =
  | 'openai' | 'anthropic' | 'gemini' | 'ollama'
  | 'groq' | 'mistral' | 'openrouter' | 'custom'

export interface EnhanceRequest {
  text: string
  mode: EnhancementMode
  provider: AIProvider
}

export interface EnhanceResponse {
  result: string
  tokens_used: number
  cost_usd: number
}

export interface AppError {
  code: string
  message: string
}

export interface Settings {
  provider: AIProvider
  stt_engine: STTEngine
  selected_mode: EnhancementMode
  privacy_mode: boolean
  hotkey_enhance: string
  hotkey_dictate: string
}
```

- [ ] **Step 2: Create `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 3) + '...'
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return '<$0.001'
  return `$${usd.toFixed(3)}`
}
```

- [ ] **Step 3: Create `src/lib/tauri.ts`** (typed invoke wrappers)

```typescript
import { invoke } from '@tauri-apps/api/core'
import type { EnhanceResponse, Settings } from '@/types'

export const tauriApi = {
  enhanceText: (text: string, mode: string, provider: string) =>
    invoke<EnhanceResponse>('enhance_text', { text, mode, provider }),

  startRecording: (engine: string) =>
    invoke<void>('start_recording', { engine }),

  stopRecording: () =>
    invoke<string>('stop_recording'),

  getSettings: () =>
    invoke<Settings>('get_settings'),

  setSettings: (settings: Settings) =>
    invoke<void>('set_settings', { settings }),

  registerHotkey: (id: string, shortcut: string) =>
    invoke<void>('register_hotkey', { id, shortcut }),

  unregisterHotkey: (id: string) =>
    invoke<void>('unregister_hotkey', { id }),

  readClipboard: () =>
    invoke<string>('read_clipboard'),

  writeClipboard: (text: string) =>
    invoke<void>('write_clipboard', { text }),
}
```

- [ ] **Step 4: Create Zustand stores**

`src/stores/settingsStore.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider, EnhancementMode, STTEngine } from '@/types'

interface SettingsState {
  provider: AIProvider
  sttEngine: STTEngine
  selectedMode: EnhancementMode
  privacyMode: boolean
  hotkeyEnhance: string
  hotkeyDictate: string
  setProvider: (p: AIProvider) => void
  setSttEngine: (e: STTEngine) => void
  setSelectedMode: (m: EnhancementMode) => void
  setPrivacyMode: (v: boolean) => void
  setHotkeyEnhance: (k: string) => void
  setHotkeyDictate: (k: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'openai',
      sttEngine: 'whisper_api',
      selectedMode: 'fix_grammar',
      privacyMode: false,
      hotkeyEnhance: 'CommandOrControl+Shift+E',
      hotkeyDictate: 'CommandOrControl+Shift+D',
      setProvider: (provider) => set({ provider }),
      setSttEngine: (sttEngine) => set({ sttEngine }),
      setSelectedMode: (selectedMode) => set({ selectedMode }),
      setPrivacyMode: (privacyMode) => set({ privacyMode }),
      setHotkeyEnhance: (hotkeyEnhance) => set({ hotkeyEnhance }),
      setHotkeyDictate: (hotkeyDictate) => set({ hotkeyDictate }),
    }),
    { name: 'promptflow-settings' }
  )
)
```

`src/stores/sessionStore.ts`:
```typescript
import { create } from 'zustand'
import type { EnhancementMode } from '@/types'

interface SessionState {
  inputText: string
  outputText: string
  activeMode: EnhancementMode
  isRecording: boolean
  setInputText: (t: string) => void
  setOutputText: (t: string) => void
  setActiveMode: (m: EnhancementMode) => void
  setIsRecording: (v: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  inputText: '',
  outputText: '',
  activeMode: 'fix_grammar',
  isRecording: false,
  setInputText: (inputText) => set({ inputText }),
  setOutputText: (outputText) => set({ outputText }),
  setActiveMode: (activeMode) => set({ activeMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  reset: () => set({ inputText: '', outputText: '', isRecording: false }),
}))
```

`src/stores/uiStore.ts`:
```typescript
import { create } from 'zustand'

interface UIState {
  overlayVisible: boolean
  isLoading: boolean
  errorMessage: string | null
  setOverlayVisible: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setError: (msg: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  overlayVisible: false,
  isLoading: false,
  errorMessage: null,
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (errorMessage) => set({ errorMessage }),
}))
```

- [ ] **Step 5: Create React Query files**

`src/queries/enhancementQueries.ts`:
```typescript
import { useMutation } from '@tanstack/react-query'
import { tauriApi } from '@/lib/tauri'
import { useSessionStore } from '@/stores/sessionStore'
import { useUIStore } from '@/stores/uiStore'
import type { EnhancementMode, AIProvider } from '@/types'

export function useEnhanceMutation() {
  const setOutputText = useSessionStore((s) => s.setOutputText)
  const setIsLoading = useUIStore((s) => s.setIsLoading)
  const setError = useUIStore((s) => s.setError)

  return useMutation({
    mutationFn: ({ text, mode, provider }: { text: string; mode: EnhancementMode; provider: AIProvider }) =>
      tauriApi.enhanceText(text, mode, provider),
    onMutate: () => { setIsLoading(true); setError(null) },
    onSuccess: (data) => { setOutputText(data.result) },
    onError: (err: Error) => { setError(err.message) },
    onSettled: () => { setIsLoading(false) },
  })
}
```

`src/queries/sttQueries.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import type { STTEngine } from '@/types'

// Stub — availability check will be implemented in v0.2 sprint
export function useSTTAvailability(_engine: STTEngine) {
  return useQuery({
    queryKey: ['stt-availability', _engine],
    queryFn: async () => ({ available: false, reason: 'Not yet implemented' }),
    enabled: false,
  })
}
```

- [ ] **Step 6: Create hook stubs**

`src/hooks/useEnhancement.ts`:
```typescript
import { useEnhanceMutation } from '@/queries/enhancementQueries'
import { useSessionStore } from '@/stores/sessionStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function useEnhancement() {
  const mutation = useEnhanceMutation()
  const inputText = useSessionStore((s) => s.inputText)
  const { provider, selectedMode } = useSettingsStore()

  const enhance = () => {
    if (!inputText.trim()) return
    mutation.mutate({ text: inputText, mode: selectedMode, provider })
  }

  return { enhance, isLoading: mutation.isPending, error: mutation.error }
}
```

`src/hooks/useSTT.ts`:
```typescript
import { useSessionStore } from '@/stores/sessionStore'

// Stub — full implementation in v0.2 sprint
export function useSTT() {
  const setIsRecording = useSessionStore((s) => s.setIsRecording)
  const isRecording = useSessionStore((s) => s.isRecording)

  const startRecording = () => setIsRecording(true)
  const stopRecording = () => setIsRecording(false)

  return { startRecording, stopRecording, isRecording }
}
```

`src/hooks/useHotkeys.ts`:
```typescript
import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { tauriApi } from '@/lib/tauri'

// Registers global hotkeys on mount, unregisters on unmount
export function useHotkeys(onEnhance: () => void, onDictate: () => void) {
  const { hotkeyEnhance, hotkeyDictate } = useSettingsStore()

  useEffect(() => {
    tauriApi.registerHotkey('enhance', hotkeyEnhance).catch(console.error)
    tauriApi.registerHotkey('dictate', hotkeyDictate).catch(console.error)

    return () => {
      tauriApi.unregisterHotkey('enhance').catch(console.error)
      tauriApi.unregisterHotkey('dictate').catch(console.error)
    }
  }, [hotkeyEnhance, hotkeyDictate])
}
```

- [ ] **Step 7: Create `src/App.tsx` and `src/main.tsx`**

`src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

`src/App.tsx`:
```typescript
export default function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <p className="text-muted-foreground">PromptFlow STT — scaffold ready</p>
    </div>
  )
}
```

- [ ] **Step 8: Create `.gitkeep` files for empty component dirs**

```bash
touch src/components/overlay/.gitkeep
touch src/components/settings/.gitkeep
touch src/components/onboarding/.gitkeep
touch src/components/ui/.gitkeep
```

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "chore: add frontend stubs (types, stores, queries, hooks)"
```

---

## Task 7: Environment config + CI workflows

**Files:** `.env.example`, `.github/workflows/ci.yml`, `.github/workflows/security.yml`

- [ ] **Step 1: Create `.env.example`**

```bash
# Copy this file to .env.local and fill in your values.
# Never commit .env.local to git.

# AI Providers — leave blank if not using
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OPENROUTER_API_KEY=

# STT Providers — leave blank if not using
DEEPGRAM_API_KEY=
ASSEMBLYAI_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=

# Telemetry (opt-in, self-hostable)
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com

# Tauri dev
TAURI_SIGNING_PRIVATE_KEY=
```

- [ ] **Step 2: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, "bootstrap/**", "feat/**", "fix/**"]
  pull_request:
    branches: [main]

jobs:
  frontend:
    name: Frontend (lint + type-check)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  rust:
    name: Rust (fmt + clippy + test)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri
      - name: Install system deps
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libasound2-dev
      - run: cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
      - run: cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
      - run: cargo test --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 3: Create `.github/workflows/security.yml`**

```yaml
name: Security

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 06:00 UTC

jobs:
  npm-audit:
    name: npm audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=high

  cargo-audit:
    name: cargo audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: taiki-e/install-action@cargo-audit
      - run: cargo audit --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 4: Commit**

```bash
git add .env.example .github/
git commit -m "chore: add CI workflows and env example"
```

---

## Task 8: Write `docs/specs/08_PROJECT_STRUCTURE.md`

**Files:**
- Create: `docs/specs/08_PROJECT_STRUCTURE.md`

- [ ] **Step 1: Write the spec**

The file must contain ALL of these sections:

**Section 1 — Annotated directory tree**: Full tree of every directory and file created in Tasks 2–7, with one-line comment per entry explaining its purpose.

**Section 2 — Naming conventions**:
- Rust: snake_case for modules, files, functions, variables. PascalCase for types/traits/enums. SCREAMING_SNAKE_CASE for constants.
- TypeScript/React: PascalCase for components and types. camelCase for functions, variables, hooks. kebab-case for file names of non-components.
- Files: one exported item per file (exception: `types/index.ts`). Test files co-located in `__tests__/` subdirectory or as `*.test.ts` siblings.
- Tauri commands: snake_case function names map to `invoke('snake_case_name', ...)` on the frontend.

**Section 3 — Where things live** (decision guide): "If you need to add a new AI provider, add it to `src-tauri/src/providers/`." "If you need a new UI component, add it to `src/components/overlay/` (for overlay) or `src/components/settings/` (for settings)." "If you need a new Tauri IPC command, add the handler to `src-tauri/src/commands/`, expose it in `lib.rs::invoke_handler`, and add a typed wrapper to `src/lib/tauri.ts`."

**Section 4 — What NOT to do**: No raw `invoke()` calls in components. No business logic in `App.tsx`. No API keys in frontend code. No Rust `unwrap()` in command handlers — always return `Result<T, AppError>`.

- [ ] **Step 2: Verify no placeholders**

```bash
grep -i "TBD\|TODO\|placeholder\|fill in" docs/specs/08_PROJECT_STRUCTURE.md
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/08_PROJECT_STRUCTURE.md
git commit -m "docs(specs): add project structure spec"
```

---

## Task 9: Write `docs/specs/01_PRD.md`

**Files:**
- Create: `docs/specs/01_PRD.md`

- [ ] **Step 1: Write the spec**

Required sections:

**1. Problem Statement**: Knowledge workers waste 2-5 minutes per text editing task context-switching to AI chat interfaces. PromptFlow STT eliminates that friction with a universal overlay.

**2. Target Users** (with personas):
- Primary: "Prompt Engineer Persona" — writes AI prompts daily, wants to enhance them without leaving the app
- Secondary: "Non-native English Speaker" — uses Fix Grammar + Formalize constantly
- Secondary: "Meeting Note-Taker" — dictates, then uses Action Items + Summarize

**3. Success Metrics (v1.0)**:
- P50 enhancement latency < 300 ms (excluding AI API round-trip)
- Binary size < 20 MB
- RAM at idle < 70 MB
- App startup < 2 s cold, < 500 ms warm
- Crash-free sessions > 99.5%
- User-reported satisfaction (post-install survey): > 4.0/5.0

**4. Feature List** (high level, reference `04_FEATURES.md` for detail):
- Clipboard capture + enhancement (12 modes)
- Voice dictation (7 STT engines)
- 8 AI providers (cloud + local)
- Privacy Mode (100% on-device)
- Global hotkeys (configurable)
- Usage cost tracking
- Auto-update

**5. Out of Scope** (for v1.0):
- Browser extension
- Mobile app
- Team/shared accounts
- Custom model fine-tuning
- Real-time collaboration
- Direct field injection via Accessibility API (planned post-v1.0)

**6. Non-Functional Requirements**:
- Cross-platform: Windows 10+, macOS 12+, Ubuntu 22.04+
- Offline-capable for Privacy Mode
- No telemetry by default (opt-in)
- All secrets in OS keychain — never in plain text

- [ ] **Step 2: Verify no placeholders**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/01_PRD.md
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/01_PRD.md
git commit -m "docs(specs): add PRD"
```

---

## Task 10: Write `docs/specs/02_COMPETITIVE_ANALYSIS.md`

**Files:**
- Create: `docs/specs/02_COMPETITIVE_ANALYSIS.md`

- [ ] **Step 1: Write the spec**

Required sections:

**1. Competitor Matrix** — Full comparison table (already in README) expanded with:
- Pricing column (PromptFlow STT: free/open source)
- Privacy/data retention column
- Hotkey support column
- Custom providers column

**2. Competitor Deep-Dives** (one paragraph each):
- **Raycast AI**: macOS only, subscription ~$8/month, strong UX, locked to their API. PromptFlow differentiator: cross-platform, bring-your-own key, open source.
- **TextSoap**: macOS only, ~$40 one-time, text cleanup focused, no AI. PromptFlow differentiator: AI-powered, voice dictation.
- **Whisper Apps** (MacWhisper, Whisper Transcription): transcription-focused, no enhancement. PromptFlow differentiator: enhancement pipeline after transcription.
- **Cursor/Copilot**: IDE-only, not universal. PromptFlow differentiator: works everywhere.

**3. Positioning Statement**: PromptFlow STT is the only cross-platform, open-source, privacy-first AI text enhancement overlay with voice dictation and bring-your-own-key support.

**4. Pricing Strategy**: Free and open source (MIT). Sustainability via: hosted cloud version (future), enterprise support contracts (future), community donations.

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/02_COMPETITIVE_ANALYSIS.md
git add docs/specs/02_COMPETITIVE_ANALYSIS.md
git commit -m "docs(specs): add competitive analysis"
```

---

## Task 11: Write `docs/specs/04_FEATURES.md`

**Files:**
- Create: `docs/specs/04_FEATURES.md`

- [ ] **Step 1: Write the spec**

For EACH of the 12 enhancement modes, document:
- **Name**
- **Description** (one sentence)
- **System prompt** (exact text passed to AI — same as `enhancement/mod.rs`)
- **Acceptance criteria** (3-5 bullet points — specific, testable)
- **In which version**: v0.1 (FixGrammar, Formalize, Shorten) · v0.2+ (rest)

For STT feature, document:
- Acceptance criteria: transcription starts within 500 ms of hotkey · partial transcripts appear in UI within 200 ms · final transcript auto-populates input field

For Clipboard Capture:
- Acceptance criteria: reads clipboard on hotkey press · preserves Unicode/emoji · max 50,000 characters (truncates with warning if exceeded)

For Privacy Mode:
- Acceptance criteria: when enabled, zero network requests made · only whisper.cpp + Ollama allowed · UI shows green "Privacy Mode" badge

For Cost Tracking:
- Acceptance criteria: every enhancement logged to SQLite · cost visible in settings "Usage" tab · monthly total shown · CSV export available

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/04_FEATURES.md
git add docs/specs/04_FEATURES.md
git commit -m "docs(specs): add feature specs with acceptance criteria"
```

---

## Task 12: Write `docs/specs/05_UI_UX.md`

**Files:**
- Create: `docs/specs/05_UI_UX.md`

- [ ] **Step 1: Write the spec**

Required sections:

**1. Design Principles**: Overlay-first (fast, dismiss quickly). Dark-only (overlays on bright apps). Keyboard-first (every action has a shortcut). Minimal chrome (content > UI).

**2. Color Tokens** (match `src/index.css` CSS variables exactly):
- `--background`: #0f172a (dark slate)
- `--primary`: #7c3aed (violet — brand color)
- `--foreground`: #f8fafc
- `--muted-foreground`: #94a3b8
- `--border`: #1e293b
- `--destructive`: #ef4444

**3. Typography**:
- Font: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- Sizes: 12px (labels), 14px (body), 16px (input), 20px (headings)

**4. Component Specs** (for each component in `src/components/`):
- OverlayWindow: 480×320px fixed. Rounded corners 12px. Blur backdrop. Drag to reposition by title bar.
- ModeSelector: Horizontal scrollable pill list. Active pill: violet bg. 12 pills total.
- TextInput: textarea, auto-resize up to 120px. Placeholder: "Paste or type text…". Ctrl+Enter to enhance.
- TextOutput: readonly div. Fade-in animation. Copy button top-right.
- ActionBar: 3 buttons — Enhance (primary), Copy Result (secondary), Clear (ghost). Keyboard shortcuts shown.

**5. Screen Flows** (ASCII flowcharts):
- First run: App launch → Onboarding Step 1 (choose provider) → Step 2 (set hotkey) → Step 3 (test) → Overlay
- Enhancement: Hotkey → Overlay appears with clipboard text → User selects mode → Enhance → Result shown → Copy → Overlay hides
- STT: Hold hotkey → Recording badge → Speak → Release → Transcript appears → Enhance

**6. Accessibility**:
- All interactive elements keyboard-navigable
- Tab order: ModeSelector → TextInput → Enhance button → Copy button
- Error states announced via aria-live region

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/05_UI_UX.md
git add docs/specs/05_UI_UX.md
git commit -m "docs(specs): add UI/UX spec"
```

---

## Task 13: Write `docs/specs/06_AI_INTEGRATIONS.md`

**Files:**
- Create: `docs/specs/06_AI_INTEGRATIONS.md`

- [ ] **Step 1: Write the spec**

For EACH AI provider, document:
- **Provider ID** (matches `AIProvider` type)
- **API endpoint**
- **Auth**: API key header name
- **Model used**: e.g., `gpt-4o-mini` for OpenAI (cost-optimized)
- **Cost estimate per 1K tokens**: approximate
- **Privacy**: data retention policy summary
- **Rust struct name**: e.g., `OpenAIProvider`

Providers: `openai` (gpt-4o-mini, $0.15/1M input) · `anthropic` (claude-haiku-4-5, $0.25/1M input) · `gemini` (gemini-1.5-flash, free tier) · `ollama` (local, free, requires Ollama running) · `groq` (llama-3.1-8b, free tier) · `mistral` (mistral-small, €0.10/1M) · `openrouter` (routing layer, price varies) · `custom` (user-defined endpoint)

For EACH STT engine, document:
- **Engine ID** (matches `STTEngine` type)
- **Mode**: cloud or local
- **API/binary**: endpoint or binary path
- **Latency target**: e.g., whisper-api < 2s for 30s audio
- **Languages**: e.g., 99 languages
- **Rust struct name**
- **Requires API key**: yes/no

STT engines: `whisper_api` (OpenAI, cloud) · `whisper_cpp` (local binary, GPU-accelerated) · `deepgram` (streaming, <200ms) · `assembly_ai` (diarization) · `google_stt` (120+ langs) · `azure_stt` (enterprise SLA) · `web_speech` (frontend-only via WebView JS API, no Rust module)

**Error handling contract**: all providers must map their errors to `AppError::Provider(String)`. Retry logic: 1 retry on 429 (rate limit) with 1s backoff. Fail fast on 401 (bad key).

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/06_AI_INTEGRATIONS.md
git add docs/specs/06_AI_INTEGRATIONS.md
git commit -m "docs(specs): add AI integrations spec"
```

---

## Task 14: Write `docs/specs/07_ROADMAP.md`

**Files:**
- Create: `docs/specs/07_ROADMAP.md`

- [ ] **Step 1: Write the spec**

For EACH milestone, document:
- **Version + theme**
- **Exact features included** (not vague "improvements")
- **Features explicitly NOT in this milestone**
- **Definition of done** (what must pass before tagging the release)

| Version | Theme | Features |
|---|---|---|
| v0.1 | Core overlay | Clipboard capture · Fix Grammar + Formalize + Shorten modes · OpenAI provider · Global hotkey (single, non-configurable) · Basic settings window |
| v0.2 | Voice dictation | Whisper API + whisper.cpp engines · STT UI (recording badge, transcript display) · Configurable hotkeys |
| v0.3 | More AI providers | Anthropic + Ollama providers · All 12 enhancement modes · Provider selector UI |
| v0.4 | Advanced STT | Deepgram streaming · AssemblyAI · Usage cost display |
| v0.5 | Privacy Mode | 100% local mode (whisper.cpp + Ollama only) · Privacy badge · Telemetry opt-in dialog |
| v0.6 | OCR | Screenshot capture (Cmd/Ctrl+Shift+S) · OCR via Tesseract · Remaining providers (Gemini, Groq, Mistral, OpenRouter) |
| v0.7 | Analytics | Cost tracking UI · Usage history · CSV export |
| v0.8 | Community | Prompt library (community-curated custom modes) · Sharing format spec |
| v1.0 | Production | Auto-updater · Code signing (Windows + macOS) · Onboarding wizard · Crash reporting (opt-in) · Full CI/CD |

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/07_ROADMAP.md
git add docs/specs/07_ROADMAP.md
git commit -m "docs(specs): add roadmap"
```

---

## Task 15: Write `docs/specs/09_CODING_GUIDELINES.md`

**Files:**
- Create: `docs/specs/09_CODING_GUIDELINES.md`

- [ ] **Step 1: Write the spec**

Required sections:

**1. Rust Style**:
- Run `cargo fmt` before every commit. CI enforces it.
- Run `cargo clippy -- -D warnings` before every PR. Zero warnings policy.
- No `unwrap()` or `expect()` in command handlers — return `Result<T, AppError>`.
- Prefer `thiserror` for error types. Never use `anyhow` in library code.
- All public functions must have a doc comment (`///`) if non-trivial.
- Test modules: `#[cfg(test)] mod tests { ... }` at bottom of each file.

**2. TypeScript/React Style**:
- `strict: true` in tsconfig. No `any` types.
- Functional components only. No class components.
- Hooks prefix: `use`. Queries in `queries/`. Side effects in hooks, not components.
- No raw `invoke()` in components — use `src/lib/tauri.ts` wrappers.
- Props interfaces: `interface ButtonProps { ... }` (not `type`).
- Exports: named exports only. No default exports from utility files.

**3. Testing Requirements**:
- Rust: unit tests for all pure functions (enhancement prompts, VAD logic, cost estimation). Integration tests for command handlers using mock providers.
- TypeScript: unit tests for store actions, hook behavior (using `@testing-library/react-hooks`). No tests needed for pure UI render (tested manually).
- Coverage target: 80% for Rust business logic modules (`enhancement/`, `providers/`, `cost/`, `storage/`).

**4. Commit Conventions** (Conventional Commits):
- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `docs(scope): description` — documentation only
- `chore(scope): description` — build, config, deps
- `refactor(scope): description` — no feature change
- `test(scope): description` — tests only
- Scope: module name (`overlay`, `stt`, `providers`, `storage`, etc.)
- Body: required for non-trivial commits. Explain WHY, not what.

**5. PR Rules**:
- No PRs to `main` without CI passing.
- Every PR requires: description of what changed, how to test manually, link to spec section if feature-related.
- Squash merge to `main` (no merge commits).
- Branch naming: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`.

- [ ] **Step 2: Verify + Commit**

```bash
grep -i "TBD\|TODO\|placeholder" docs/specs/09_CODING_GUIDELINES.md
git add docs/specs/09_CODING_GUIDELINES.md
git commit -m "docs(specs): add coding guidelines"
```

---

## Task 16: Write remaining docs

**Files:** `docs/PRIVACY.md`, `docs/THREAT_MODEL.md`, `docs/PERFORMANCE.md`, `docs/RELEASE.md`

- [ ] **Step 1: Write `docs/PRIVACY.md`**

Required sections:
- **What we collect** (default): nothing. Zero telemetry by default.
- **What we collect** (opt-in): anonymous event: `enhancement_triggered` (mode, provider, token count, latency) — no text content, no PII.
- **Where it's stored**: locally in SQLite (`~/.local/share/com.clawd.promptflow-stt/usage.db` on Linux; platform equivalents on Windows/macOS). Opt-in telemetry: PostHog (self-hostable).
- **API Keys**: stored in OS keychain (macOS Keychain, Windows Credential Manager, libsecret on Linux). Never written to disk in plain text.
- **Text content**: never stored or transmitted beyond the AI provider you choose. We don't see it.
- **Your AI provider**: their privacy policy applies to the text you send them.
- **GDPR**: for EU users — all data is local. No data processor relationship with us. Your AI provider may be a data processor under their own terms.
- **Deleting your data**: delete `~/.local/share/com.clawd.promptflow-stt/` (or platform equivalent). Remove keychain entries via OS keychain manager.

- [ ] **Step 2: Write `docs/THREAT_MODEL.md`**

Required sections:
- **Assets**: API keys (high value), text content (medium value), user settings (low value)
- **Threat actors**: malicious app on same machine, network attacker (MITM), malicious npm/cargo package
- **Attack surface**: OS keychain access (mitigated: keychain isolated per app), HTTPS to AI APIs (mitigated: TLS, certificate pinning TBD), supply chain (mitigated: cargo audit + npm audit in CI, pinned dependency versions), local SQLite (mitigated: no sensitive data stored there — only token counts and costs)
- **Explicitly out of scope**: physical access to machine, compromised OS, malicious user
- **Security contacts**: `security@clawd.io` (placeholder — update before v1.0)

- [ ] **Step 3: Write `docs/PERFORMANCE.md`**

Required sections:
- **Latency budget** (enhancement happy path):
  - Hotkey detection → clipboard read: < 50 ms
  - Clipboard read → invoke: < 10 ms
  - Rust dispatch → provider API call: < 20 ms
  - Provider API response → clipboard write: < 20 ms
  - **Total (excluding API latency)**: < 100 ms. API adds 100-3000 ms depending on provider.
- **Memory targets**: idle < 60 MB RSS. Peak (during STT) < 150 MB.
- **Binary size**: < 20 MB compressed installer.
- **Startup**: cold < 2 s, warm (process already running) < 500 ms.
- **Measuring**: use `tauri::performance` API for IPC timing. `time` command for startup. `ps aux` for RSS.
- **Optimization rules**: no synchronous Rust in command handlers (always `async`). No blocking calls in React render path. Zustand selectors must be granular (no selecting entire store object).

- [ ] **Step 4: Write `docs/RELEASE.md`**

Required sections:
- **Branch model**: feature branches → `bootstrap/initial-setup` → PR → `main`. `main` is always releasable.
- **Versioning**: Semantic Versioning. `v0.x` = pre-release (breaking changes allowed). `v1.0` = stable public API.
- **Release checklist**: [ ] All CI green · [ ] `cargo audit` clean · [ ] `npm audit` clean · [ ] `CHANGELOG.md` updated · [ ] Version bumped in `package.json` + `src-tauri/Cargo.toml` + `src-tauri/tauri.conf.json` · [ ] Git tag created (`git tag v0.x.0`) · [ ] GitHub Release created with binary artifacts
- **Code signing**: Windows (EV certificate, GitHub Actions secret `TAURI_SIGNING_PRIVATE_KEY`) · macOS (Apple Developer ID, notarization via `tauri-action`) · Linux (no signing required, AppImage + deb)
- **CI/CD release flow**: tag push `v*` → GitHub Actions builds for all 5 targets → uploads artifacts to GitHub Release → auto-updater endpoint updated.

- [ ] **Step 5: Verify all four files**

```bash
grep -rli "TBD\|TODO\|placeholder" docs/PRIVACY.md docs/THREAT_MODEL.md docs/PERFORMANCE.md docs/RELEASE.md
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add docs/PRIVACY.md docs/THREAT_MODEL.md docs/PERFORMANCE.md docs/RELEASE.md
git commit -m "docs: add PRIVACY, THREAT_MODEL, PERFORMANCE, RELEASE docs"
```

---

## Task 17: Verify build compiles

- [ ] **Step 1: Install Node dependencies**

```bash
npm install
```

Expected: no errors. Ignore peer dependency warnings.

- [ ] **Step 2: Type-check frontend**

```bash
npm run type-check
```

Expected: exit 0, no TypeScript errors.

- [ ] **Step 3: Check Rust compiles**

```bash
cd src-tauri && cargo check
```

Expected: exit 0. Warnings about `todo!()` macros are expected. No errors.

- [ ] **Step 4: Run Rust formatter check**

```bash
cd src-tauri && cargo fmt -- --check
```

Expected: exit 0.

- [ ] **Step 5: Run Clippy**

```bash
cd src-tauri && cargo clippy -- -D warnings
```

Expected: exit 0. If warnings appear from `todo!()` stubs, suppress with `#[allow(dead_code)]` on the relevant items.

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve compile warnings from build verification"
```

Only run this step if step 3-5 required code fixes.

---

## Task 18: Final cleanup commit

- [ ] **Step 1: Create `SECURITY.md`** (referenced in README)

```markdown
# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.x (pre-release) | ✅ |

## Reporting a Vulnerability

Email **security@clawd.io** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

We will acknowledge within 48 hours and aim to release a fix within 14 days for critical issues.

Do NOT open a public GitHub issue for security vulnerabilities.
```

- [ ] **Step 2: Create `CODE_OF_CONDUCT.md`** (referenced in CONTRIBUTING.md)

```markdown
# Code of Conduct

## Our Pledge

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone regardless of age, body size, disability, ethnicity, gender identity, experience level, nationality, religion, or sexual orientation.

## Our Standards

**Acceptable behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior:**
- Harassment, trolling, or personal attacks
- Publishing others' private information without permission
- Sexual language or imagery
- Any conduct that could reasonably be considered inappropriate

## Enforcement

Violations can be reported to **conduct@clawd.io**. All reports will be reviewed and investigated. Maintainers are obligated to maintain confidentiality.

Violations may result in a temporary or permanent ban from the project.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.1.
```

- [ ] **Step 3: Commit community health files**

```bash
git add SECURITY.md CODE_OF_CONDUCT.md
git commit -m "docs: add SECURITY and CODE_OF_CONDUCT"
```

- [ ] **Step 4: Check for any remaining untracked files**

```bash
git status
```

Expected: working tree clean. If any untracked files appear, add and commit them.

- [ ] **Step 2: Verify all 13 spec files exist**

```bash
ls docs/specs/
ls docs/PRIVACY.md docs/THREAT_MODEL.md docs/PERFORMANCE.md docs/RELEASE.md
```

Expected: 9 files in `docs/specs/` + 4 files in `docs/`.

- [ ] **Step 3: Verify no placeholder text anywhere in docs**

```bash
grep -ri "TBD\|TODO\|placeholder\|fill in\|coming soon" docs/
```

Expected: no output.

- [ ] **Step 4: Print final git log**

```bash
git log --oneline
```

Expected: ~20 commits showing the full bootstrap history.
