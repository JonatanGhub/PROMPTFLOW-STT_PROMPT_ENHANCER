# Roadmap — PromptFlow STT

**Date:** 2026-04-22
**Status:** Approved
**Branch:** bootstrap/initial-setup

---

## Overview

PromptFlow STT ships in 9 versioned milestones from functional scaffold to production-ready release. Each milestone has a clear scope boundary, an explicit "not in this version" list, and a verifiable definition of done.

---

## v0.1 — Core Overlay

**Theme:** A working clipboard-to-clipboard text enhancement loop.

**Included:**
- Clipboard capture on global hotkey press (reads from OS clipboard)
- Enhancement modes: `fix_grammar`, `formalize`, `shorten` (3 of 12)
- AI provider: OpenAI only (`gpt-4o-mini`)
- Single global hotkey (`Ctrl+Shift+E` / `Cmd+Shift+E`), non-configurable in this version
- Basic settings window: API key input (stored in OS keychain), provider display
- Result automatically written back to clipboard
- Overlay window: 480×320 px, no decorations, always-on-top, transparent

**Explicitly NOT in v0.1:**
- Voice dictation / STT of any kind
- Hotkey configuration UI
- More than 3 enhancement modes
- More than 1 AI provider
- Cost tracking
- Onboarding wizard
- Privacy Mode

**Definition of done:**
- `cargo check` exits 0 (no Rust compile errors)
- `npm run type-check` exits 0 (no TypeScript errors)
- CI passes on `main` (lint + type-check + cargo check)
- Manual QA on Windows 10+ and macOS 13+: hotkey fires, clipboard text appears in overlay, "Fix Grammar" mode returns result, result is in clipboard
- API key stored in OS keychain (verified via keychain manager) and not present in any file on disk

---

## v0.2 — Voice Dictation

**Theme:** Speak to text, then enhance.

**Included:**
- STT engines: `whisper_api` (OpenAI) and `whisper_cpp` (local binary)
- STT UI: recording badge in overlay title bar, real-time transcript display in TextInput
- Partial transcript streaming via `stt://chunk` events
- Configurable hotkeys: separate "Enhance" and "Dictate" hotkeys, editable in settings
- VAD (Voice Activity Detection): auto-stop after 1.5 s of silence below −40 dBFS

**Explicitly NOT in v0.2:**
- Streaming STT engines (Deepgram, AssemblyAI) — deferred to v0.4
- More AI providers
- Additional enhancement modes
- Privacy Mode

**Definition of done:**
- Manual QA: dictation hotkey triggers recording, badge appears, speech is transcribed within 2 s (cloud) / 5 s (local), transcript populates TextInput
- `whisper_cpp` binary bundled or detected in PATH; graceful error shown if missing
- Hotkey configuration saved to `settingsStore` and persists across restarts
- CI still green

---

## v0.3 — More AI Providers

**Theme:** Provider choice and all enhancement modes.

**Included:**
- AI providers: `anthropic` (`claude-haiku-4-5`) and `ollama` (local, any model)
- All 12 enhancement modes: `fix_grammar`, `formalize`, `shorten`, `expand`, `translate`, `brainstorm`, `action_items`, `summarize`, `code_review`, `simplify`, `reframe`, `custom`
- Provider selector UI in settings (radio group or dropdown)
- `custom` mode: free-text system prompt field in settings

**Explicitly NOT in v0.3:**
- Groq, Mistral, OpenRouter, Gemini providers — deferred to v0.6
- Usage cost display — deferred to v0.4
- Privacy Mode

**Definition of done:**
- All 12 enhancement modes return non-empty results against OpenAI in manual QA
- Anthropic and Ollama providers work end-to-end with a valid key / running server
- Provider selector persists across restarts
- CI green

---

## v0.4 — Advanced STT

**Theme:** Streaming transcription and cost visibility.

**Included:**
- STT engines: `deepgram` (streaming, WebSocket), `assembly_ai` (batch, diarization)
- Deepgram partial transcripts delivered via `stt://chunk` with < 200 ms latency
- Usage cost display: per-request cost shown in overlay footer after enhancement
- Cost data written to SQLite `usage_log` table on every completed request

**Explicitly NOT in v0.4:**
- Google STT, Azure STT — deferred to post-v1.0
- Usage history dashboard UI — deferred to v0.7
- Privacy Mode

**Definition of done:**
- Manual QA: Deepgram streaming shows live transcript during speech
- SQLite `usage_log` has correct rows after 5 manual enhancement requests (verified with `sqlite3`)
- Cost shown in overlay footer for OpenAI and Anthropic requests
- CI green

---

## v0.5 — Privacy Mode

**Theme:** 100% offline operation.

**Included:**
- Privacy Mode toggle in settings
- When enabled: all cloud providers and cloud STT engines are disabled; only `ollama`, `custom` (localhost), `whisper_cpp`, and `web_speech` are selectable
- Green "Privacy Mode" badge in overlay title bar
- Telemetry opt-in dialog (shown once at first launch; opt-in telemetry sends anonymous usage events to PostHog)
- Zero outbound network requests during Privacy Mode (verified by traffic inspection)

**Explicitly NOT in v0.5:**
- OCR features
- Analytics dashboard

**Definition of done:**
- Manual QA on macOS: Privacy Mode on → sniff network traffic → zero external requests during enhancement and STT
- Provider and STT selectors visibly restricted in settings
- Badge visible in overlay title bar
- Telemetry opt-in dialog shown on first run after enabling anonymous analytics
- CI green

---

## v0.6 — OCR

**Theme:** Capture text from screenshots.

**Included:**
- Screenshot capture hotkey (`Ctrl+Shift+S` / `Cmd+Shift+S`): captures a screen region and runs OCR
- OCR engine: Tesseract (bundled or detected in PATH)
- Remaining AI providers: `gemini` (`gemini-1.5-flash`), `groq` (`llama-3.1-8b-instant`), `mistral` (`mistral-small-latest`), `openrouter` (user-configurable model)

**Explicitly NOT in v0.6:**
- Google STT or Azure STT integration
- Community prompt library

**Definition of done:**
- Manual QA: screenshot hotkey triggers region selector, OCR text appears in TextInput within 3 s
- All 4 new providers return valid completions in manual QA
- CI green

---

## v0.7 — Analytics

**Theme:** Full usage transparency.

**Included:**
- Settings → Usage tab: monthly total cost in USD, per-provider breakdown (requests, tokens, cost)
- Usage history: last 90 days of requests, sortable by date/mode/provider
- CSV export: download `usage_export_YYYY-MM.csv`

**Definition of done:**
- Manual QA: 10 test requests made, all visible in Usage tab with correct mode, provider, cost
- CSV export downloads a valid file that opens in Excel/LibreOffice
- CI green

---

## v0.8 — Community

**Theme:** Sharable custom modes.

**Included:**
- Prompt library: browse and import community-curated custom modes from a GitHub-hosted JSON registry
- Sharing format spec: JSON schema for a PromptFlow custom mode (`name`, `system_prompt`, `description`, `author`, `version`)
- "Share this mode" button: generates a shareable JSON snippet for clipboard

**Definition of done:**
- Prompt library loads at least 5 example modes from the registry URL
- Shared JSON snippet round-trips: paste into another instance, mode is importable
- CI green

---

## v1.0 — Production

**Theme:** Stable, signed, auto-updating public release.

**Included:**
- Auto-updater (`tauri-plugin-updater`): prompts user when a new version is available; downloads and installs silently on approval
- Code signing: Windows (EV certificate via `TAURI_SIGNING_PRIVATE_KEY`), macOS (Apple Developer ID + notarization via `tauri-action`)
- Onboarding wizard: 3-step first-run flow (choose provider → set hotkey → test)
- Crash reporting (opt-in): anonymous crash reports sent to Sentry or equivalent
- Full CI/CD: tag push → build all 5 targets → GitHub Release artifacts → auto-updater endpoint updated

**Explicitly NOT in v1.0:**
- Mobile apps
- Browser extension
- Team/multi-user features

**Definition of done:**
- `cargo check`, `npm run type-check`, `cargo clippy -- -D warnings`, `npm run lint` all exit 0
- `cargo audit` and `npm audit` return zero high/critical vulnerabilities
- Signed installers verified on Windows 10, macOS 13, Ubuntu 22.04
- Auto-updater tested: install v0.9 → updater prompts → installs v1.0 → app restarts on new version
- Onboarding wizard completes end-to-end in manual QA (provider key → hotkey → test enhancement → overlay shown)
- `CHANGELOG.md` accurate; `package.json`, `Cargo.toml`, `tauri.conf.json` all show `1.0.0`
- GitHub Release created with `.msi`, `.dmg`, `.deb`, and `AppImage` artifacts
