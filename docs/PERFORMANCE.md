# Performance — PromptFlow STT

**Date:** 2026-04-22
**Status:** Approved

---

## Targets

| Metric | Target | Notes |
|---|---|---|
| Idle RAM | **< 60 MB RSS** | Core process at rest, overlay hidden |
| Peak RAM (during STT) | **< 150 MB RSS** | With audio buffer in memory |
| Cold startup | **< 2 s** | From double-click to overlay visible |
| Warm overlay show | **< 500 ms** | Process already running, hotkey → overlay appears |
| Compressed installer | **< 20 MB** | Without bundled whisper.cpp model |

---

## Enhancement Latency Budget (happy path, excluding AI API time)

| Step | Budget |
|---|---|
| Hotkey detection → clipboard read | < 50 ms |
| Clipboard read → `invoke('enhance_text')` | < 10 ms |
| Rust: dispatch → AI provider API call starts | < 20 ms |
| AI provider response → `write_clipboard()` complete | < 20 ms |
| **Total (our code, excluding API round-trip)** | **< 100 ms** |

AI API latency adds 100–3 000 ms depending on provider and model. Local providers (Ollama) add 500–5 000 ms depending on hardware.

---

## Optimization Rules

- **No synchronous I/O in Rust command handlers.** All command functions must be `async`. Blocking calls (`std::fs::read`, synchronous HTTP) must use `tokio::task::spawn_blocking`.
- **No blocking calls in the React render path.** Components must not call `invoke()` directly — only via hooks that manage loading state.
- **Granular Zustand selectors.** Never select the entire store object (`useSettingsStore()` instead of `useSettingsStore(s => s.provider)`). Coarse selectors cause the entire component tree to re-render on any store change.
- **Fire-and-forget logging.** Writing to the SQLite `usage_log` table must not add latency to the user-facing path. Use `tokio::spawn` and ignore the handle.
- **No re-renders on STT chunks.** `stt://chunk` events update `sessionStore.inputText` directly — components reading `inputText` must use a debounced selector (16 ms) to avoid per-chunk re-renders.

---

## Measuring

| What | How |
|---|---|
| Rust IPC latency | Log `std::time::Instant::now()` at command entry and exit; emit as `perf://ipc` event (debug builds only) |
| Startup time | `time tauri dev` (dev) or OS `time` command (production binary) |
| RAM | `ps aux --sort rss` (Linux/macOS) or Task Manager → Details (Windows) |
| Installer size | `ls -lh target/release/bundle/` after `npm run tauri build` |
| React render performance | Chrome DevTools → Performance tab → record 5 s of overlay use |

---

## Performance Budget Violations

If a PR introduces a regression exceeding these targets, it must be reverted or fixed before merging. The reviewer is responsible for calling out performance-sensitive changes in the PR description.
