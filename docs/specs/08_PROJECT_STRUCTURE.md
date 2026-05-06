# PromptFlow STT — Project Structure

**Spec:** 08  
**Date:** 2026-04-23  
**Status:** Approved  
**Branch:** bootstrap/initial-setup

---

## 1. Full Annotated Directory Tree

This tree reflects the real scaffold committed on `bootstrap/initial-setup`. Every file and directory is annotated with its purpose.

```
PromptFlow-STT/                         # Repo root
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint + type-check + Rust fmt/clippy/test on every push/PR
│       └── security.yml               # npm audit + cargo audit (weekly schedule + every push to main)
├── .claude/
│   └── settings.local.json            # Local Claude Code permissions — not committed to main
├── public/
│   └── assets/
│       └── brand/
│           └── logo.svg               # App logo — used in index.html and bundle metadata
├── src/                               # React/TypeScript frontend (runs inside Tauri WebView)
│   ├── App.tsx                        # Root component — provider wrapper only (QueryClient, stores)
│   ├── main.tsx                       # React entry point — mounts <App /> into #root
│   ├── index.css                      # Tailwind base/components/utilities directives + CSS variables
│   ├── components/
│   │   ├── overlay/                   # Main floating overlay window: input area, mode selector, output
│   │   │   └── .gitkeep              # Bootstrap stub — components implemented in v0.1 sprint
│   │   ├── settings/                  # Settings panel: API keys, hotkeys, provider config, privacy toggle
│   │   │   └── .gitkeep              # Bootstrap stub — components implemented in v0.1 sprint
│   │   ├── onboarding/                # First-run wizard (3 steps: provider, hotkey, test)
│   │   │   └── .gitkeep              # Bootstrap stub — components implemented in v0.1 sprint
│   │   └── ui/                        # shadcn/ui component re-exports + custom primitives
│   │       └── .gitkeep              # Bootstrap stub — shadcn components added per feature sprint
│   ├── hooks/
│   │   ├── useEnhancement.ts          # Trigger AI text enhancement, track loading/error/result state
│   │   ├── useSTT.ts                  # Start/stop dictation, receive transcript chunks via Tauri events
│   │   └── useHotkeys.ts              # Register/unregister global hotkeys from frontend via IPC
│   ├── stores/
│   │   ├── settingsStore.ts           # Zustand: provider config, selected mode, hotkey prefs, privacy flag
│   │   ├── sessionStore.ts            # Zustand: current input/output text, active enhancement mode
│   │   └── uiStore.ts                 # Zustand: overlay visible flag, loading states, error banners
│   ├── queries/
│   │   ├── enhancementQueries.ts      # React Query mutations for AI enhancement API calls
│   │   └── sttQueries.ts              # React Query queries for STT engine status and config
│   ├── lib/
│   │   ├── tauri.ts                   # Typed invoke() wrappers — the only place raw invoke strings live
│   │   └── utils.ts                   # cn() (clsx + tailwind-merge), format helpers
│   └── types/
│       └── index.ts                   # Shared TS types: EnhancementMode, STTEngine, Provider, AppError…
├── src-tauri/                         # Rust backend (Tauri v2)
│   ├── build.rs                       # Tauri build script — required by tauri-build
│   ├── Cargo.toml                     # Rust crate manifest and dependency declarations
│   ├── tauri.conf.json                # Tauri app config: bundle ID, window settings, plugin permissions
│   ├── capabilities/
│   │   └── default.json               # Tauri v2 capability file: clipboard-all, global-shortcut-all, shell:open
│   └── src/
│       ├── main.rs                    # Binary entry point — calls lib::run()
│       ├── lib.rs                     # App setup: plugin registration, invoke_handler, window config
│       ├── commands/                  # All #[tauri::command] functions — the entire IPC surface
│       │   ├── mod.rs                 # Re-exports all command modules for lib.rs to consume
│       │   ├── enhance.rs             # enhance_text(text, mode, provider) → Result<String, AppError>
│       │   ├── stt.rs                 # start_recording(), stop_recording(), transcribe() commands
│       │   ├── settings.rs            # get_settings(), set_settings(settings) commands
│       │   ├── hotkeys.rs             # register_hotkey(action, combo), unregister_hotkey(action) commands
│       │   └── clipboard.rs           # read_clipboard(), write_clipboard(text) commands
│       ├── audio/                     # Microphone capture layer (cpal)
│       │   ├── mod.rs                 # Re-exports capture and vad modules
│       │   ├── capture.rs             # Microphone capture via cpal — device selection, PCM stream
│       │   └── vad.rs                 # Voice Activity Detection — silence detection for auto-stop
│       ├── stt/                       # Speech-to-text engine abstraction
│       │   ├── mod.rs                 # STTEngine trait definition
│       │   └── engines/
│       │       ├── mod.rs             # Re-exports all engine implementations
│       │       ├── whisper_api.rs     # OpenAI Whisper API engine (cloud)
│       │       ├── whisper_cpp.rs     # whisper.cpp local engine (Privacy Mode)
│       │       ├── deepgram.rs        # Deepgram Nova-2 engine (cloud)
│       │       ├── assembly_ai.rs     # AssemblyAI Universal-2 engine (cloud)
│       │       ├── google_stt.rs      # Google Cloud Speech-to-Text engine (cloud)
│       │       └── azure_stt.rs       # Azure Cognitive Services STT engine (cloud)
│       ├── enhancement/               # AI text enhancement dispatch
│       │   └── mod.rs                 # EnhancementMode enum, build_prompt(), dispatch to provider
│       ├── providers/                 # AI provider abstraction layer
│       │   └── mod.rs                 # AIProvider trait + per-provider stubs (openai, anthropic, etc.)
│       ├── hotkeys/                   # Global hotkey management
│       │   ├── mod.rs                 # Re-exports manager module
│       │   └── manager.rs             # Global hotkey registration via tauri-plugin-global-shortcut
│       ├── clipboard/                 # Clipboard read/write
│       │   ├── mod.rs                 # Re-exports manager module
│       │   └── manager.rs             # Read/write via tauri-plugin-clipboard-manager
│       ├── storage/                   # Persistent storage
│       │   ├── mod.rs                 # Re-exports db and keychain modules
│       │   ├── db.rs                  # SQLite via rusqlite: usage log, enhancement history
│       │   └── keychain.rs            # API key storage via keyring crate (OS keychain)
│       ├── permissions/               # OS permission checks
│       │   ├── mod.rs                 # Re-exports checker module
│       │   └── checker.rs             # Microphone permission, macOS accessibility permission checks
│       ├── updater/                   # Auto-update
│       │   ├── mod.rs                 # Re-exports manager module
│       │   └── manager.rs             # Auto-update via tauri-plugin-updater
│       ├── telemetry/                 # Opt-in anonymous telemetry
│       │   ├── mod.rs                 # Re-exports events module
│       │   └── events.rs              # PostHog event emission (only when user has opted in)
│       ├── cost/                      # API usage cost tracking
│       │   ├── mod.rs                 # Re-exports tracker module
│       │   └── tracker.rs             # Token counting, per-provider cost estimation, SQLite persistence
│       └── error/
│           └── mod.rs                 # AppError enum, thiserror derive, Serialize impl for IPC transport
├── docs/
│   ├── specs/                         # All 13 formal spec documents
│   │   ├── 01_PRD.md                  # Product Requirements Document
│   │   ├── 02_COMPETITIVE_ANALYSIS.md # Competitor matrix and positioning
│   │   ├── 03_ARCHITECTURE.md         # Full technical architecture and IPC contract
│   │   ├── 04_FEATURES.md             # Feature list with acceptance criteria
│   │   ├── 05_UI_UX.md                # Design system, color tokens, screen flows
│   │   ├── 06_AI_INTEGRATIONS.md      # Provider and STT contracts, API key handling
│   │   ├── 07_ROADMAP.md              # v0.1 → v1.0 milestone scope
│   │   ├── 08_PROJECT_STRUCTURE.md    # This file — annotated directory tree
│   │   └── 09_CODING_GUIDELINES.md    # Rust + React style, testing, commit conventions
│   └── superpowers/
│       ├── plans/
│       │   └── 2026-04-22-bootstrap.md  # Bootstrap implementation plan (18 tasks)
│       └── specs/
│           └── 2026-04-22-promptflow-stt-design.md  # Original design document (approved)
├── .editorconfig                      # Editor whitespace/indent consistency across editors
├── .env.example                       # Example env vars — copy to .env.local, never commit secrets
├── .eslintrc.json                     # ESLint config for TypeScript + React hooks rules
├── .gitattributes                     # Git line-ending and binary file handling
├── .gitignore                         # Excludes: node_modules, dist, src-tauri/target, .env.local
├── .nvmrc                             # Node version pin: "20"
├── CONTRIBUTING.md                    # Contribution guide: setup, PR flow, commit conventions
├── LICENSE                            # MIT license
├── README.md                          # Project overview, quick-start, architecture summary
├── components.json                    # shadcn/ui config: style, Tailwind paths, component aliases
├── index.html                         # HTML shell — Vite entry point, mounts <div id="root">
├── package.json                       # npm manifest: scripts, dependencies, devDependencies
├── rust-toolchain.toml                # Rust toolchain pin (stable channel + component list)
├── tailwind.config.ts                 # Tailwind v3 config: content paths, design tokens
├── tsconfig.json                      # TypeScript config for src/ (browser target, strict mode)
├── tsconfig.node.json                 # TypeScript config for vite.config.ts (Node target)
└── vite.config.ts                     # Vite config: @vitejs/plugin-react, @tauri-apps/vite-plugin
```

---

## 2. Naming Conventions

### Rust

| Construct | Convention | Example |
|---|---|---|
| Modules / files | `snake_case` | `enhancement/mod.rs`, `cost/tracker.rs` |
| Functions | `snake_case` | `enhance_text`, `build_prompt`, `start_recording` |
| Variables / bindings | `snake_case` | `api_key`, `input_text`, `provider_config` |
| Types / structs / enums | `PascalCase` | `AppError`, `EnhancementMode`, `STTEngine` |
| Traits | `PascalCase` | `AIProvider`, `SpeechEngine` |
| Enum variants | `PascalCase` | `EnhancementMode::FixGrammar`, `AppError::ApiError` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RECORDING_SECONDS`, `DEFAULT_TIMEOUT_MS` |
| Tauri command functions | `snake_case` (name matches `invoke` call) | `fn enhance_text(...)` ↔ `invoke('enhance_text', ...)` |

Rust files mirror the module they export: `enhancement/mod.rs` exports `EnhancementMode`; `commands/enhance.rs` exports `enhance_text`. No "god files" — one primary responsibility per file.

### TypeScript / React

| Construct | Convention | Example |
|---|---|---|
| React components | `PascalCase` filename and export | `OverlayWindow.tsx`, `ModeSelector.tsx` |
| Non-component `.ts` files | `camelCase` | `tauri.ts`, `utils.ts`, `enhancementQueries.ts` |
| Functions / variables | `camelCase` | `enhanceText`, `selectedMode`, `isLoading` |
| Custom hooks | `camelCase` with `use` prefix | `useEnhancement`, `useSTT`, `useHotkeys` |
| Types / interfaces | `PascalCase` | `EnhancementMode`, `ProviderConfig`, `AppError` |
| Enum-like string unions | `PascalCase` | `type EnhancementMode = 'FixGrammar' | 'Formalize' | ...` |
| CSS/Tailwind token names | `kebab-case` (CSS custom properties) | `--color-overlay-bg`, `--radius-overlay` |

Test files live as siblings of the module they test: `useEnhancement.test.ts` next to `useEnhancement.ts`. Alternatively inside `__tests__/` at the same directory level. Never in a top-level `tests/` directory for unit tests.

### Tauri IPC

- Rust command function name is `snake_case` and **exactly matches** the first argument to `invoke()` on the frontend.
- All frontend `invoke` calls are wrapped in `src/lib/tauri.ts` — components call the typed wrapper, never `invoke` directly.
- Event names follow `namespace://event` convention: `stt://chunk`, `stt://done`, `hotkey://triggered`.

---

## 3. Where Things Live (Decision Guide)

Use this section to locate exactly which files to touch for any common development task.

**Add a new AI provider** (e.g., Cohere, Perplexity)
- Create `src-tauri/src/providers/<name>.rs` implementing the `AIProvider` trait from `providers/mod.rs`
- Register the new struct in `providers/mod.rs`
- Add the variant to the `Provider` enum in `providers/mod.rs`
- Add the variant to `src/types/index.ts` `Provider` type
- Add API key storage logic in `storage/keychain.rs` for the new provider name
- Add settings fields in `commands/settings.rs` and `src/stores/settingsStore.ts`

**Add a new STT engine** (e.g., Rev.ai, Speechmatics)
- Create `src-tauri/src/stt/engines/<name>.rs` implementing the `STTEngine` trait from `stt/mod.rs`
- Register the new struct in `src-tauri/src/stt/engines/mod.rs`
- Add the variant to the `STTEngine` enum in `stt/mod.rs`
- Add the variant to `src/types/index.ts` `STTEngine` type
- Web Speech API is frontend-only (WebView JS API) — no Rust module needed for it

**Add a new enhancement mode** (e.g., ELI5, Tweet Thread)
- Add the variant to `EnhancementMode` enum in `src-tauri/src/enhancement/mod.rs`
- Add a `build_prompt` match arm in `enhancement/mod.rs` returning the system prompt string
- Add the variant to `EnhancementMode` in `src/types/index.ts`
- Add the display label and icon in the mode selector component (under `src/components/overlay/`)

**Add a new Tauri IPC command**
1. Create or extend `src-tauri/src/commands/<module>.rs` — annotate with `#[tauri::command]`, return `Result<T, AppError>`
2. Add `pub use <module>::<fn_name>;` to `src-tauri/src/commands/mod.rs`
3. Register in `src-tauri/src/lib.rs` `invoke_handler` macro
4. Add a typed wrapper function in `src/lib/tauri.ts` calling `invoke('<fn_name>', args)`
5. Call the wrapper from hooks or queries — never from components directly

**Add a UI component for the overlay**
- Add the `.tsx` file under `src/components/overlay/`
- Export from the component file, import in `OverlayWindow.tsx` (the root overlay component)
- Use only `src/components/ui/` primitives (shadcn/ui) for base elements

**Add a UI component for settings**
- Add the `.tsx` file under `src/components/settings/`
- Connect to `settingsStore` via selectors, not direct state subscription

**Change hotkey defaults**
- Edit `src/stores/settingsStore.ts` — change the `hotkeyEnhance` and/or `hotkeyDictate` default values in the initial state
- The Rust side reads whatever is stored — no Rust change needed for defaults

**Add a new Zustand store**
- Create `src/stores/<name>Store.ts` using the `create<T>()` pattern consistent with `settingsStore.ts`
- Import and use via selectors in hooks (`useStore((s) => s.field)`) — not spread into components

**Add a new React Query mutation or query**
- Add to `src/queries/enhancementQueries.ts` (AI calls) or `src/queries/sttQueries.ts` (STT calls)
- Create a new file under `src/queries/` only if the domain is clearly distinct

**Change the Tauri window configuration** (size, transparency, always-on-top)
- Edit `src-tauri/tauri.conf.json` — the `windows` array for the overlay window

**Add or change app permissions / capabilities**
- Edit `src-tauri/capabilities/default.json` — Tauri v2 capability grants

**Add a Rust dependency**
- Add to `[dependencies]` in `src-tauri/Cargo.toml`

**Add a frontend npm dependency**
- Add via `npm install <package>` — `package.json` is updated automatically

---

## 4. What NOT to Do

These are hard rules, not guidelines. Violations break architectural contracts.

**No raw `invoke()` calls in components or hooks.**
All Tauri IPC goes through `src/lib/tauri.ts`. This is the single source of truth for command names. Scattering raw invoke strings across the codebase makes refactoring impossible and types invisible.

**No business logic in `App.tsx`.**
`App.tsx` is a provider wrapper (QueryClientProvider, React Router if added). All logic belongs in hooks, stores, or queries. If you find yourself writing a `useEffect` in `App.tsx` that is not provider setup, move it to a hook.

**No API keys in frontend code.**
API keys are stored exclusively in the OS keychain via `src-tauri/src/storage/keychain.rs`. The frontend never receives a raw key — it only triggers IPC calls that use the key server-side. Never log, display, or pass keys through IPC responses.

**No `unwrap()` or `expect()` in `#[tauri::command]` handlers.**
Every command returns `Result<T, AppError>`. Use `?` propagation. `unwrap()` and `expect()` will panic the Rust thread and produce an unhandled crash from the frontend's perspective. The `AppError` enum in `error/mod.rs` is the single error type for all IPC boundaries.

**No selecting the entire Zustand store.**
Always use selectors: `const mode = useSessionStore((s) => s.activeMode)`. Never `const store = useSessionStore()` followed by `store.activeMode`. Whole-store subscriptions cause every component that uses them to re-render on any state change anywhere in the store.

**No panic-stub macros in command handlers after a sprint ships.**
Rust's built-in `unimplemented!()` panic macro is acceptable during bootstrap scaffolding only. Once a feature sprint begins, stubs must return a typed error (`AppError::NotImplemented`) or a real implementation — never a panic macro. The same rule applies to any macro that panics on call.

**No test files outside `src/` for frontend unit tests.**
Unit tests for TypeScript modules live as siblings (`.test.ts`) or in `__tests__/` at the module level. A top-level `tests/` directory is reserved for integration tests that span the Rust/TypeScript boundary (Tauri WebDriver tests).

**No direct SQLite queries outside `storage/db.rs`.**
All database access is mediated through functions in `src-tauri/src/storage/db.rs`. Other modules call those functions — they do not hold `Connection` references or write SQL strings.
