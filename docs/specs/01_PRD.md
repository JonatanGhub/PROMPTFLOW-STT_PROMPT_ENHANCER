# PromptFlow STT — Product Requirements Document

**Spec:** 01  
**Date:** 2026-04-23  
**Status:** Approved  
**Branch:** bootstrap/initial-setup

---

## 1. Problem Statement

Knowledge workers who write prompts, emails, meeting notes, and code comments spend 2–5 minutes per task switching between their current app and an AI chat interface. This context switch is not just a time cost — it breaks flow, forces re-reading of what was already in front of them, and creates a secondary tool dependency that only works inside the AI app's editor.

The problem has three concrete sub-problems:

1. **Context switching costs focus.** Every time a writer pastes text into ChatGPT, Claude.ai, or Notion AI and waits for a response, they abandon their working context. Resuming focus after an interruption takes an average of 23 minutes (Gloria Mark, UCI). The actual time spent in the AI tool is not the cost — the re-orientation is.

2. **Voice dictation tools don't enhance text.** Existing dictation tools (Windows Voice Typing, macOS Dictation, Dragon) transcribe speech but do nothing with the raw output. Users who want to clean grammar, formalize tone, or summarize their dictation must paste into a separate tool. There is no integrated path from voice to polished text.

3. **AI writing tools are locked to specific apps or subscriptions.** Notion AI only works in Notion. Grammarly only works in browsers with its extension. Cursor only works in its IDE. Users who want AI writing help across email, Slack, a terminal, a game, or any other app are forced to maintain multiple subscriptions or use the clipboard manually every time.

PromptFlow STT solves all three with a single universal desktop overlay: one global hotkey, any app, any provider, any text, returned to the clipboard in under 300 ms.

---

## 2. Target Users

### Persona 1 — Alex, Prompt Engineer

**Profile:** Senior AI developer, 28–40, works in VS Code and a browser. Writes 20+ AI prompts per day for system prompts, few-shot examples, and tool descriptions. Uses Claude, OpenAI, and local Ollama models interchangeably.

**Pain:** Constantly copying draft prompts out of the IDE, pasting into Claude.ai, editing, copying back. Wants to refine prompts without leaving the IDE. Has existing API keys for all major providers and does not want to pay for a subscription on top of what he already pays per token.

**Needs:**
- Speed above all — enhancement must feel instant
- Custom enhancement modes (at minimum: a free-text custom prompt)
- Support for any AI provider, including local Ollama models
- Keyboard-driven workflow, no mouse required after hotkey

**Success looks like:** Alex triggers the overlay with a hotkey, selects "Improve Prompt" mode, hits Enter, and the enhanced text is back in his clipboard before he re-focuses the IDE.

---

### Persona 2 — Maria, Non-native English Professional

**Profile:** Operations manager, 35–50, writes professional emails and reports in English as her second language. Fluent but unsure about idioms, register, and grammar under time pressure.

**Pain:** Writes an email quickly in informal English, then rewrites it twice before sending because she is uncertain about tone. Has tried Grammarly but does not want her business correspondence passing through a third-party server she doesn't control. Works in Outlook on Windows — no AI writing tools integrate there.

**Needs:**
- Fix Grammar and Formalize modes — the two she will use every day
- Privacy option: run 100% on-device with no data leaving her machine
- Works in Outlook (and any other Windows app) — not browser-dependent
- Simple interface that does not require understanding AI providers

**Success looks like:** Maria writes a quick draft in Outlook, triggers PromptFlow STT with a hotkey, selects "Formalize", and replaces her clipboard paste with a polished version — without ever leaving Outlook or sending text to an external server.

---

### Persona 3 — David, Meeting Facilitator

**Profile:** Product manager or consultant, 30–45, runs 4–6 meetings per day. Records meetings with a local tool, transcribes them, and needs to extract action items and summaries for distribution within 10 minutes of the meeting ending.

**Pain:** Raw transcripts are long, messy, and full of filler. David currently pastes them into ChatGPT one section at a time to get summaries. The process takes 15–20 minutes and breaks his immediate post-meeting window for follow-up.

**Needs:**
- High-accuracy STT — either cloud (Deepgram, AssemblyAI) or local (whisper.cpp for offline/air-gapped situations)
- Action Items and Summarize modes that work on long text
- Reliable dictation for real-time notes during meetings
- Fast turnaround — the 10-minute post-meeting window is non-negotiable

**Success looks like:** David pastes the full raw transcript, triggers PromptFlow STT with "Action Items" mode, and has a formatted list ready to send in under 30 seconds — total.

---

## 3. Success Metrics (v1.0)

These are the objective criteria that define a successful v1.0 release. All are measurable.

| Metric | Target | Measurement Method |
|---|---|---|
| P50 enhancement latency (excluding AI API) | < 300 ms | Instrumented timing from hotkey press to clipboard-write |
| Compressed installer size | < 20 MB | CI artifact size check on every release build |
| RAM at idle (overlay hidden) | < 70 MB RSS | Automated memory sampling in CI integration test |
| App cold startup time | < 2 s | Time from launch to overlay-ready event |
| App warm startup (overlay show) | < 500 ms | Time from hotkey to overlay visible |
| Crash-free sessions (30-day rolling) | > 99.5% | Opt-in telemetry crash event rate |
| User-reported satisfaction | > 4.0 / 5.0 | Post-install survey (n > 100, voluntary) |
| 60-day weekly active user retention | > 40% | Opt-in telemetry active-session events |

All telemetry-based metrics require the user to have opted in to anonymous usage reporting. Retention and satisfaction targets apply only once the user base reaches n > 100 opted-in users.

---

## 4. Feature List (v1.0 High Level)

### Text Enhancement
- Clipboard capture: read current clipboard content as input
- 12 enhancement modes: Fix Grammar, Formalize, Shorten, Expand, Translate, Brainstorm, Action Items, Summarize, Code Review, Simplify, Reframe, Custom
- Custom mode: user-supplied system prompt stored in settings
- Output returned to clipboard automatically; user can review before pasting

### Voice Dictation
- 7 STT engine options: OpenAI Whisper API, whisper.cpp (local), Deepgram Nova-2, AssemblyAI Universal-2, Google Cloud Speech-to-Text, Azure Cognitive Services STT, Web Speech API (browser-native, no API key required)
- Push-to-talk and toggle modes
- Visual audio level indicator while recording
- Transcript auto-copied to clipboard on stop

### AI Provider Support
- 8 providers: OpenAI, Anthropic, Google Gemini, Ollama (local), Groq, Mistral AI, OpenRouter, Custom (user-supplied base URL + API key)
- Bring-your-own-key: API keys stored in OS keychain, never plain text on disk
- Per-provider model selection (e.g., choose gpt-4o vs gpt-4o-mini for OpenAI)

### Privacy Mode
- 100% on-device path: whisper.cpp (STT) + Ollama (AI enhancement)
- When Privacy Mode is active, zero network calls are made for STT or enhancement
- Privacy Mode indicator in the overlay UI

### Global Hotkeys
- Configurable hotkey to trigger enhancement (default: Ctrl+Shift+Space / Cmd+Shift+Space)
- Configurable hotkey to trigger dictation (default: Ctrl+Shift+D / Cmd+Shift+D)
- Hotkeys work in any foreground app on Windows, macOS, and Linux

### Usage Cost Tracking
- Token counting per request (input + output)
- Per-provider cost estimation based on published pricing
- Usage summary accessible in settings (daily/weekly totals)

### First-Run Onboarding Wizard
- Step 1: Choose primary AI provider and enter API key
- Step 2: Configure global hotkeys (or accept defaults)
- Step 3: Run a test enhancement to verify the setup

### Auto-Update
- In-app update notifications via tauri-plugin-updater
- Staged rollout support via update server
- User-controlled: "Check for updates" button + optional automatic install

---

## 5. Out of Scope (v1.0)

These items are explicitly excluded from v1.0. They may be revisited in future milestones.

| Item | Reason / Future Path |
|---|---|
| Browser extension | Requires separate distribution channel, manifest v3 complexity. Considered for v1.2. |
| Mobile app | Different platform stack (iOS/Android). Not in scope for any near-term milestone. |
| Team accounts / collaboration | Requires auth, backend, multi-user data model. Post-v1.0 SaaS path only. |
| Custom model fine-tuning | Requires training infrastructure. Not in scope for desktop app. |
| Real-time multi-speaker diarization UI | Diarization API exists (AssemblyAI, Deepgram) but building a real-time speaker-labeled UI is a separate feature track. |
| Direct field injection via OS Accessibility API | Injecting text directly into the focused field (bypassing clipboard) requires macOS AX API + Windows UI Automation. High complexity, OS-specific. Planned for v1.1. |
| Web interface / SaaS hosted version | Separate product. Not part of the open-source desktop app. |
| Custom wake-word detection | Requires always-on microphone processing. Privacy and performance trade-off deferred to post-v1.0. |
| Offline mode for cloud AI providers | Contradicts the nature of cloud APIs. Privacy Mode (Ollama + whisper.cpp) is the offline path. |

---

## 6. Non-Functional Requirements

### Platform Support
- **Windows:** Windows 10 (build 1903+) and Windows 11. x64 only for v1.0 (arm64 Windows considered for v1.1).
- **macOS:** macOS 12 Monterey and later. Both Intel (x86_64) and Apple Silicon (aarch64) — universal binary.
- **Linux:** Ubuntu 22.04 LTS and later. x64. GTK3 dependency via Tauri/WebKitGTK.

### Offline Capability
- When Privacy Mode is enabled (whisper.cpp + Ollama), the app must function with zero network access.
- Update checks fail gracefully — no crash, no blocking dialog when offline.

### Telemetry
- No telemetry collected by default.
- Users are shown a clear opt-in prompt during first run.
- Opting in sends anonymous, non-PII events to a self-hostable PostHog instance.
- Users can opt out at any time in settings. Opting out deletes all previously collected data from the server (if using managed instance).

### Secrets Handling
- API keys are stored exclusively in the OS-native keychain: Credential Manager (Windows), Keychain (macOS), libsecret/kwallet (Linux).
- API keys are never written to disk in plain text, never included in logs, and never serialized in IPC responses to the frontend.
- The `.env` file is for development configuration only — it never contains production API keys.

### Installation Privileges
- The app must install and run without administrator (Windows) or root (macOS/Linux) privileges.
- The installer uses user-level install paths: `%LOCALAPPDATA%` (Windows), `~/Applications` or `/Applications` with user ownership (macOS), `~/.local` (Linux).

### Accessibility
- The overlay and settings panel must be keyboard-navigable (Tab order, focus rings, Escape to close).
- All interactive elements must have accessible labels (ARIA or native semantic HTML) for screen reader compatibility.
- Color contrast ratios must meet WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text).

### Internationalisation
- UI strings are in English for v1.0.
- The codebase uses i18n-ready patterns (no hardcoded strings in render paths) to facilitate future localisation.
