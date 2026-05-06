# PromptFlow STT — Design Document

**Date:** 2026-04-22
**Author:** CTO (Claude Code) + Jonatan García Ripollés
**Status:** Approved
**Branch:** bootstrap/initial-setup

---

## 1. Project Summary

PromptFlow STT is a cross-platform desktop overlay (Windows · macOS · Linux) built with Tauri v2 (Rust backend + React/TypeScript frontend). It captures text from clipboard or voice dictation, enhances it via AI, and returns the result to the clipboard in under 300 ms. Direct injection into the focused field (via OS Accessibility API) is planned for a later milestone.

Target user: knowledge workers who write prompts, emails, code comments, or any text repeatedly and want AI-assisted enhancement without leaving their current app.

---

## 2. Stack Decisions (Final)

| Layer | Technology | Reason |
|---|---|---|
| Desktop framework | Tauri v2 | ~15 MB binary, ~60 MB RAM, cross-platform, no Electron overhead |
| Backend | Rust (stable) | Performance, memory safety, OS-level access (hotkeys, clipboard, audio) |
| Frontend | React 18 + TypeScript | Component model fits overlay UI, TS adds safety |
| UI styling | Tailwind CSS + shadcn/ui | Fast iteration, headless components, fully customizable |
| State (UI/local) | Zustand | Minimal boilerplate, perfect for overlay-size app |
| State (async/APIs) | React Query (TanStack Query) | Handles AI/STT API calls, caching, error states |
| Scaffold method | `npm create tauri-app` | Generates working project immediately, then extended manually |

---

## 3. Architecture

### 3.1 Layers

```
┌─────────────────────────────────────────────────────────┐
│  React/TypeScript Frontend (Tauri WebView)              │
│  Overlay · Settings · Onboarding                        │
└──────────────────────┬──────────────────────────────────┘
                       │ Tauri IPC
                       │  - invoke() → request/response
                       │  - emit/listen → streaming events (STT)
┌──────────────────────▼──────────────────────────────────┐
│  Rust Backend (src-tauri/src/)                           │
│  commands/ · audio/ · stt/ · enhancement/               │
│  providers/ · hotkeys/ · clipboard/ · storage/          │
│  permissions/ · updater/ · telemetry/ · cost/ · error/  │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    OS Keychain    SQLite DB    AI/STT APIs
```

### 3.2 Frontend Module Structure

```
src/
├── components/
│   ├── overlay/        # Main floating window: input, mode selector, output
│   ├── settings/       # API keys, hotkeys, provider config, privacy toggle
│   ├── onboarding/     # First-run wizard (3 steps: provider, hotkey, test)
│   └── ui/             # shadcn/ui component re-exports + custom primitives
├── hooks/
│   ├── useEnhancement.ts   # Trigger enhancement, track state
│   ├── useSTT.ts           # Start/stop dictation, receive transcript
│   └── useHotkeys.ts       # Register/unregister global hotkeys from frontend
├── stores/
│   ├── settingsStore.ts    # Provider config, selected mode, hotkey prefs
│   ├── sessionStore.ts     # Current input/output text, active mode
│   └── uiStore.ts          # Overlay visible, loading states, error banners
├── queries/
│   ├── enhancementQueries.ts   # React Query mutations for AI calls
│   └── sttQueries.ts           # React Query for STT API status/config
├── lib/
│   ├── tauri.ts        # Typed invoke() wrappers (no raw strings in components)
│   └── utils.ts        # cn(), format helpers
└── types/
    └── index.ts        # Shared TS interfaces: EnhancementMode, STTEngine, Provider…
```

### 3.3 Backend Module Structure

```
src-tauri/src/
├── commands/           # #[tauri::command] functions — the IPC surface
│   ├── enhance.rs      # enhance_text(text, mode, provider)
│   ├── stt.rs          # start_recording(), stop_recording(), transcribe()
│   ├── settings.rs     # get_settings(), set_settings()
│   ├── hotkeys.rs      # register_hotkey(), unregister_hotkey()
│   └── clipboard.rs    # read_clipboard(), write_clipboard()
├── audio/
│   ├── capture.rs      # Microphone capture via cpal
│   └── vad.rs          # Voice Activity Detection (silence detection)
├── stt/
│   ├── mod.rs          # STTEngine trait
│   └── engines/
│       ├── whisper_api.rs
│       ├── whisper_cpp.rs
│       ├── deepgram.rs
│       ├── assembly_ai.rs
│       ├── google_stt.rs
│       └── azure_stt.rs
# Note: Web Speech API is frontend-only (WebView JS API) — no Rust module needed
├── enhancement/
│   ├── mod.rs          # EnhancementMode enum + dispatch
│   ├── fix_grammar.rs
│   ├── formalize.rs
│   ├── shorten.rs
│   ├── expand.rs
│   ├── translate.rs
│   ├── brainstorm.rs
│   ├── action_items.rs
│   ├── summarize.rs
│   ├── code_review.rs
│   ├── simplify.rs
│   ├── reframe.rs
│   └── custom.rs
├── providers/
│   ├── mod.rs          # AIProvider trait
│   ├── openai.rs
│   ├── anthropic.rs
│   ├── gemini.rs
│   ├── ollama.rs
│   ├── groq.rs
│   ├── mistral.rs
│   ├── openrouter.rs
│   └── custom.rs
├── hotkeys/
│   └── manager.rs      # Global hotkey registration via tauri-plugin-global-shortcut
├── clipboard/
│   └── manager.rs      # Read/write via tauri-plugin-clipboard-manager
├── storage/
│   ├── db.rs           # SQLite via rusqlite (usage log, history)
│   └── keychain.rs     # API keys via keyring crate (OS keychain)
├── permissions/
│   └── checker.rs      # Mic permission, accessibility permission (macOS)
├── updater/
│   └── manager.rs      # tauri-plugin-updater
├── telemetry/
│   └── events.rs       # Opt-in anonymous events (PostHog self-hostable)
├── cost/
│   └── tracker.rs      # Token counting, per-provider cost estimation
├── error/
│   └── mod.rs          # AppError enum, thiserror derive, IPC serialization
├── lib.rs              # App setup, plugin registration, command registration
└── main.rs             # Entry point
```

### 3.4 IPC Contract

- **Request/response** (`invoke`): enhance_text, read_clipboard, write_clipboard, get/set settings, register_hotkey
- **Streaming** (Tauri events): STT transcript chunks emitted as `stt://chunk` events, final transcript as `stt://done`
- All commands return `Result<T, AppError>` — errors propagate to frontend as typed objects

### 3.5 `tauri.conf.json` Key Decisions

- `bundle.identifier`: `com.clawd.promptflow-stt`
- Overlay window: no decorations, always-on-top, transparent background, resizable: false
- Permissions: `clipboard-all`, `global-shortcut-all`, `shell:open` (for whisper.cpp binary)

---

## 4. Scaffold Plan

### Step 1 — Base scaffold
```bash
npm create tauri-app@latest PromptFlow-STT -- --template react-ts
```

### Step 2 — Add dependencies
```bash
# Frontend
npm install @tanstack/react-query zustand
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init

# Rust (Cargo.toml)
# tauri-plugin-global-shortcut, tauri-plugin-clipboard-manager
# tauri-plugin-updater, rusqlite, keyring, cpal, thiserror, serde, tokio
```

### Step 3 — Add project files
```
.nvmrc                  # "20"
.env.example
tailwind.config.ts
components.json         # shadcn config
docs/specs/             # 13 spec documents
docs/PRIVACY.md
docs/THREAT_MODEL.md
docs/PERFORMANCE.md
docs/RELEASE.md
.github/workflows/ci.yml
.github/workflows/security.yml
tests/unit/
tests/integration/
```

---

## 5. Specs Plan

Writing order and ownership:

| Order | File | Writes first because... |
|---|---|---|
| 1 | `03_ARCHITECTURE.md` | Defines modules — scaffold depends on it |
| 2 | Scaffold | Based on architecture |
| 3 | `08_PROJECT_STRUCTURE.md` | Documents the real scaffold |
| 4+ | All others | Parallel — no dependencies between them |

### All 13 Spec Documents

| # | Path | Scope |
|---|---|---|
| 01 | `docs/specs/01_PRD.md` | Problem, users, success metrics, out-of-scope |
| 02 | `docs/specs/02_COMPETITIVE_ANALYSIS.md` | vs Raycast, TextSoap, Whisper apps — positioning |
| 03 | `docs/specs/03_ARCHITECTURE.md` | Full technical architecture, module contracts, IPC |
| 04 | `docs/specs/04_FEATURES.md` | Each feature with acceptance criteria |
| 05 | `docs/specs/05_UI_UX.md` | Design system, color tokens, component specs, screen flows |
| 06 | `docs/specs/06_AI_INTEGRATIONS.md` | Provider + STT engine contracts, API keys, error handling |
| 07 | `docs/specs/07_ROADMAP.md` | v0.1→v1.0 with exact scope per milestone |
| 08 | `docs/specs/08_PROJECT_STRUCTURE.md` | Annotated directory tree, naming conventions |
| 09 | `docs/specs/09_CODING_GUIDELINES.md` | Rust style, React style, testing rules, commit/PR conventions |
| — | `docs/PRIVACY.md` | Data collected, storage, opt-out, GDPR notes |
| — | `docs/THREAT_MODEL.md` | Attack surface, mitigations, secrets handling |
| — | `docs/PERFORMANCE.md` | Latency <300ms, RAM <60MB, binary size targets |
| — | `docs/RELEASE.md` | Release process, code signing, CI/CD, changelog |

---

## 6. Success Criteria

- `npm run tauri dev` works on first run after scaffold
- All 13 spec docs complete, no TBDs or placeholders
- `03_ARCHITECTURE.md` matches the actual scaffold structure exactly
- CI pipeline passes (lint + build) on `bootstrap/initial-setup` branch

---

## 7. Out of Scope (for this bootstrap phase)

- Actual feature implementation (starts in v0.1 sprint)
- UI mockups / Figma files
- Production CI secrets (signing keys, etc.)
- Any external service setup (PostHog, update server)
