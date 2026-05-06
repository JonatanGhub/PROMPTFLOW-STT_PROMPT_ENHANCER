# PromptFlow STT — Competitive Analysis

**Spec:** 02  
**Date:** 2026-04-23  
**Status:** Approved  
**Branch:** bootstrap/initial-setup

---

## 1. Competitor Matrix

| Feature | PromptFlow STT | Raycast AI | TextSoap | MacWhisper | GitHub Copilot / Cursor |
|---|---|---|---|---|---|
| **Open source** | Yes (MIT) | No | No | No | No |
| **Privacy mode (local, no network)** | Yes (whisper.cpp + Ollama) | No | N/A | Partial (local transcription only) | No |
| **Voice dictation** | Yes (7 engines) | No | No | Yes (transcription only) | No |
| **AI text enhancement** | Yes (12 modes) | Yes (limited) | No (rule-based only) | No | Yes (code-focused) |
| **Cross-platform** | Yes (Win / macOS / Linux) | macOS only | macOS only | macOS only | Yes (Win / macOS / Linux) |
| **Custom AI providers (BYO key)** | Yes (8 providers + custom) | No (proprietary API) | No | No | No (GitHub/Azure-backed) |
| **Global hotkey (any app)** | Yes | Yes | No | No | No |
| **Works outside IDE/browser** | Yes (any app via clipboard) | Yes (launcher) | No | No | No |
| **Binary size (approx.)** | < 20 MB | ~120 MB | ~25 MB | ~80 MB | ~300 MB (VS Code ext.) |
| **RAM at idle (approx.)** | < 70 MB | ~200 MB | ~30 MB (inactive) | ~50 MB | ~400 MB (VS Code) |
| **Price** | Free (open source) | Free tier + $8/mo Pro | ~$40 one-time | Free + $20 one-time (Pro) | $10–$19/mo (GitHub) / $20/mo (Cursor) |

Notes on matrix methodology: binary size and RAM figures are estimates based on technology stack and published benchmarks. PromptFlow STT figures are targets from the PRD; all others are from vendor documentation and community measurements as of 2026. TextSoap RAM is reported while the app is backgrounded after use.

---

## 2. Competitor Deep-Dives

### Raycast AI

Raycast is a macOS-only productivity launcher with a built-in AI writing layer. Its UX is excellent — quick to open, keyboard-centric, well-designed — and it has a loyal user base among macOS power users. The AI features include text translation, tone adjustment, and prompt templates that can act on selected text from other apps. The Pro plan (~$8/month as of 2026) is required for AI access. The core limitation is that Raycast's AI layer is completely closed: it routes all requests through Raycast's own backend, making it impossible to use Anthropic's Claude, a local Ollama model, or any other provider directly. Users with existing API contracts or privacy requirements have no alternative path. Raycast is also macOS-exclusive, which eliminates it entirely for Windows and Linux users. There is no voice dictation capability. PromptFlow STT's differentiators against Raycast are: cross-platform support, bring-your-own-key for any provider (including local), open-source code that can be audited and self-hosted, Privacy Mode with zero network calls, and integrated voice dictation.

### TextSoap (Unmarked Software)

TextSoap is a macOS utility (~$40 one-time purchase) specializing in text cleanup through deterministic rules: stripping whitespace, normalizing Unicode, fixing line endings, correcting encoding errors, adjusting case. It is genuinely useful for cleaning messy text imported from PDFs, legacy systems, or web scraping. However, it has no AI capabilities whatsoever — every transformation is a defined rule, not a language model. There is no voice input. The tool is macOS-only and has no global hotkey mechanism; users must manually move text into the TextSoap window. Its target user is someone cleaning data rather than enhancing prose. PromptFlow STT does not compete with TextSoap on data cleaning — it does not attempt to strip encoding artifacts. The differentiation is: AI-powered natural language enhancement, voice input, global hotkey for any app, cross-platform availability, and free open-source distribution.

### MacWhisper / Whisper Transcription Apps

MacWhisper (Jordi Bruin) and similar whisper-based transcription apps (Whisper Transcription, Aiko) are macOS tools focused exclusively on converting audio to text, typically by running whisper.cpp locally or calling the OpenAI Whisper API. They achieve excellent transcription accuracy, especially for the larger Whisper model variants. The critical gap is that transcription is their entire product: after the transcript is produced, the user must manually copy it and take it somewhere else for any further processing. There is no enhancement layer, no AI summarization, no action item extraction, no grammar correction. Additionally these tools are all macOS-only. PromptFlow STT's differentiators: STT is one input method that feeds directly into 12 enhancement modes in one workflow — voice to polished text without leaving the app. Also cross-platform, and the local STT engine (whisper.cpp) is one of seven engine options rather than the entire product surface.

### GitHub Copilot / Cursor

GitHub Copilot and Cursor are AI-assisted coding tools built as extensions to or forks of VS Code. Both provide exceptional value for software development workflows: inline code completion, natural language to code, code explanation, and in-context refactoring within the editor. The fundamental constraint is that they operate exclusively within an IDE. They cannot assist a developer writing a Slack message, a project manager drafting a Confluence page, or anyone working in a native desktop application, terminal multiplexer, or any non-IDE context. Cursor in particular is a fork of VS Code — it literally cannot exist outside VS Code. Both tools are also expensive relative to raw API costs: Copilot is $10–$19/month and Cursor is $20/month, with no bring-your-own-key option. PromptFlow STT's differentiators: universal clipboard-based overlay that works in every app on the OS, bring-your-own-key, open source, and a voice dictation path that these tools lack entirely.

### Notion AI / Grammarly

Notion AI and Grammarly represent the embedded-AI-in-SaaS category. Notion AI provides AI writing tools inside Notion pages: summarize, improve writing, translate, brainstorm. Grammarly provides grammar correction and tone suggestions inside a browser extension for web apps and a desktop app for email clients on macOS. Both tools are polished and well-integrated within their ecosystems. The constraint is hard: Notion AI only works inside Notion documents; Grammarly only works where the Grammarly extension or integration is active. Neither works in terminal emulators, native apps without browser frames, code editors, or any app outside their explicit integration list. Grammarly also has well-documented privacy concerns — all text processed by Grammarly passes through Grammarly's servers regardless of plan tier. PromptFlow STT's differentiators: works in any app via global hotkey and clipboard, not limited to specific app integrations, provides a local/private processing path, includes voice dictation, is open source, and is free.

---

## 3. Positioning Statement

PromptFlow STT is the only cross-platform, open-source, privacy-first AI text enhancement overlay with integrated voice dictation and bring-your-own-key provider support.

While every competitor either locks users to a specific app (Notion AI, Grammarly, Copilot/Cursor), a specific OS (Raycast, TextSoap, MacWhisper), a specific vendor's API (Raycast, Copilot), or ignores enhancement entirely (MacWhisper), PromptFlow STT occupies the intersection that none of them address: a universal, lightweight, OS-level writing co-pilot that works in every application, respects user privacy, and does not require a subscription on top of the user's existing API spend.

The positioning is "universal AI writing co-pilot" — the tool that is always one hotkey away, regardless of what app is in focus, who made the AI model, and whether the user is online.

---

## 4. Pricing Strategy

**Core product: free and open source under the MIT License.**

The desktop application will always be free to download, use, and self-build from source. There is no feature-gating in the open-source release, no trial period, and no telemetry by default. The cost of using PromptFlow STT is only the cost of the AI API calls the user already chooses to make with their own keys. Users who choose Privacy Mode (Ollama + whisper.cpp) pay nothing beyond hardware.

**Sustainability path (post-v1.0, not committed for v1.0):**

Three options are under consideration for long-term sustainability, none of which will be gated against the open-source core:

1. **Hosted cloud tier** — a managed version with pre-provisioned API keys for users who do not want to manage their own keys. Priced per token consumed, with a free tier covering typical light usage. This is a separate product from the open-source app; the open-source app is not modified.

2. **Enterprise support contracts** — paid support SLAs, custom deployment (air-gapped, self-hosted update server), and priority feature requests for organizations that need a supported version.

3. **Community donations via GitHub Sponsors** — voluntary support for individual contributors and open-source users who want to fund ongoing maintenance.

No decision on which sustainability path to pursue will be made before v1.0 ships and usage data is available to inform the choice.

---

## 5. Market Risks

### Risk 1: Raycast expands to Windows and Linux

Raycast's macOS-only constraint is a significant differentiator. If Raycast ships a Windows or Linux version, it would eliminate the cross-platform advantage and bring its established brand, UX quality, and AI integrations to the same audience. This is a credible risk given the growth of Windows power users in the developer market.

**Mitigation:** PromptFlow STT's bring-your-own-key model, open-source auditability, and Privacy Mode are independent of platform. Even if Raycast goes cross-platform, it will not offer local-only processing or custom API providers. Open source also means PromptFlow STT can be self-hosted and audited — a durable differentiator for security-conscious users and organizations.

### Risk 2: AI providers add native overlay tools

If OpenAI, Anthropic, or Google ship their own OS-level overlay tools (which all three have experimented with as of 2025–2026), they would combine first-party API access with the same global-hotkey-plus-clipboard interaction model. An OpenAI overlay would offer seamless GPT access without key management friction.

**Mitigation:** A provider-specific overlay locks the user to that provider's model and pricing. PromptFlow STT's multi-provider model is the hedge: users who want to switch from OpenAI to Anthropic to a local Mistral model can do so without switching tools. Privacy Mode remains a unique differentiator regardless of what cloud providers build.

### Risk 3: OS-level AI integration makes overlays redundant

Windows Copilot (deeply integrated in Windows 11) and Apple Intelligence (macOS 15+) are moving AI writing assistance into the OS layer itself. If "right-click → Rewrite" or "Ctrl+Alt+R → Improve Writing" becomes a native OS feature with comparable quality, the need for a third-party overlay diminishes significantly for mainstream users.

**Mitigation:** OS-native AI tools are always locked to the platform vendor's models and subject to the platform vendor's privacy policies, pricing changes, and regional availability restrictions. Users in privacy-sensitive industries, users in countries where OS AI features are not available, and users who need specific models (e.g., Claude for creative writing, Llama for air-gapped deployment) will continue to need an open, cross-platform, provider-agnostic tool. The open-source nature of PromptFlow STT also means the community can fork and maintain it indefinitely, independent of any single company's product roadmap.
