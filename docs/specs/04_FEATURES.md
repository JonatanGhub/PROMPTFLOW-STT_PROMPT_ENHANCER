# Features — PromptFlow STT

## 1. Enhancement Modes

Each enhancement mode routes through `src-tauri/src/enhancement/mod.rs`. The system prompt listed below is the exact string returned by `build_prompt()` for that variant.

---

### 1.1 Fix Grammar

**Description:** Corrects grammar and spelling errors in the input text, returning only the corrected version with no additional commentary.

**System prompt:**
```
You are a grammar correction assistant. Fix grammar and spelling errors. Return only the corrected text, no explanations.
```

**Acceptance criteria:**
- Given input with at least three distinct grammar errors, all errors are corrected in the output.
- Output contains no meta-commentary, preamble, or explanation — only the corrected text.
- Whitespace and paragraph structure are preserved unless they were themselves erroneous.
- Response latency (excluding API network time) is under 300 ms.
- Enhancement is logged to SQLite with `mode = "fix_grammar"`.

**Milestone:** v0.1

---

### 1.2 Formalize

**Description:** Rewrites the input text in a formal, professional tone suitable for business or academic contexts.

**System prompt:**
```
You are a writing assistant. Rewrite the text in a formal, professional tone. Return only the rewritten text.
```

**Acceptance criteria:**
- Output removes contractions, colloquialisms, and informal phrasing present in the input.
- Semantic meaning of the original text is preserved — no facts are added or omitted.
- Output contains only the rewritten text, no labels like "Formal version:" or explanatory notes.
- Works on inputs up to 50,000 characters without truncation error.
- Enhancement is logged to SQLite with `mode = "formalize"`.

**Milestone:** v0.1

---

### 1.3 Shorten

**Description:** Condenses the input text to its essential meaning, removing redundancy and filler while keeping key points intact.

**System prompt:**
```
You are a writing assistant. Shorten the text while preserving the key meaning. Return only the shortened text.
```

**Acceptance criteria:**
- Output is measurably shorter than the input (character count reduced by at least 20% for inputs over 100 characters).
- All primary assertions or facts from the input are present in the output.
- Output contains only the shortened text, no annotations or length indicators.
- Does not introduce new information not present in the input.
- Enhancement is logged to SQLite with `mode = "shorten"`.

**Milestone:** v0.1

---

### 1.4 Expand

**Description:** Enriches the input text with additional detail, context, and elaboration while staying on topic.

**System prompt:**
```
You are a writing assistant. Expand the text with more detail and context. Return only the expanded text.
```

**Acceptance criteria:**
- Output is longer than the input (character count increased by at least 30% for inputs under 500 characters).
- Expansions are topically relevant — no off-topic tangents introduced.
- Output contains only the expanded text, no meta-text like "Here is an expanded version:".
- Does not contradict or alter the factual claims in the original input.
- Enhancement is logged to SQLite with `mode = "expand"`.

**Milestone:** v0.3

---

### 1.5 Translate

**Description:** Translates the input to English; if the input is already in English, translates it to Spanish.

**System prompt:**
```
Translate the text to English. If already in English, translate to Spanish. Return only the translation.
```

**Acceptance criteria:**
- English-language input produces Spanish-language output and vice versa.
- Non-English, non-Spanish input (e.g., French, German, Japanese) is translated to English.
- Output contains only the translated text — no language labels, notes, or caveats.
- Proper nouns, brand names, and technical terms that should not be translated are preserved.
- Enhancement is logged to SQLite with `mode = "translate"`.

**Milestone:** v0.3

---

### 1.6 Brainstorm

**Description:** Generates five related ideas or angles based on the input, formatted as a numbered list.

**System prompt:**
```
You are a creative assistant. Generate 5 related ideas or angles based on the input. Return as a numbered list.
```

**Acceptance criteria:**
- Output contains exactly 5 numbered items (1. through 5.).
- Each item is distinct — no duplicate or near-duplicate entries.
- All items are thematically related to the input topic.
- Output format is a plain numbered list with no extra headers, preamble, or closing remarks.
- Enhancement is logged to SQLite with `mode = "brainstorm"`.

**Milestone:** v0.3

---

### 1.7 Action Items

**Description:** Extracts all action items from the input and returns them as a Markdown task checklist.

**System prompt:**
```
Extract all action items from the text. Return as a markdown checklist using '- [ ] item' format.
```

**Acceptance criteria:**
- Every explicit action or task mentioned in the input appears as a `- [ ] item` line in the output.
- Output uses exactly the `- [ ] item` format — no other list styles.
- Items that are observations or facts (not actions) are not included.
- Output contains only the checklist — no heading like "Action Items:" prepended.
- Enhancement is logged to SQLite with `mode = "action_items"`.

**Milestone:** v0.3

---

### 1.8 Summarize

**Description:** Condenses the input into a concise 2-3 sentence summary capturing the core message.

**System prompt:**
```
Summarize the text in 2-3 sentences. Return only the summary.
```

**Acceptance criteria:**
- Output is 2 to 3 sentences (period-terminated) regardless of input length.
- The core topic and main conclusion of the input are present in the summary.
- Output contains only the summary text — no preamble like "Here is a summary:".
- Works on inputs between 50 and 50,000 characters.
- Enhancement is logged to SQLite with `mode = "summarize"`.

**Milestone:** v0.3

---

### 1.9 Code Review

**Description:** Reviews the input code for bugs, style issues, and improvement opportunities, returning a bulleted findings list.

**System prompt:**
```
Review the code for bugs, style issues, and improvements. Return a bulleted list of findings.
```

**Acceptance criteria:**
- Output is a bulleted list (each item begins with `- ` or `• `).
- At least one finding is returned for any non-trivial code input (more than 5 lines).
- Findings are categorized by severity where possible (bug, style, improvement) — either inline or via bullet prefix.
- Output contains only the findings list — no code block of the original code repeated back.
- Enhancement is logged to SQLite with `mode = "code_review"`.

**Milestone:** v0.3

---

### 1.10 Simplify

**Description:** Rewrites the input using plain language so someone without domain expertise can understand it.

**System prompt:**
```
Simplify the text so a non-expert can understand it. Return only the simplified text.
```

**Acceptance criteria:**
- Output replaces jargon, acronyms (unexplained), and complex sentence structures with plain equivalents.
- Core meaning of the input is preserved — no important facts are dropped.
- Output contains only the simplified text — no explanation of what was simplified.
- Reading level of output is measurably lower than input (verifiable with readability tools in QA).
- Enhancement is logged to SQLite with `mode = "simplify"`.

**Milestone:** v0.3

---

### 1.11 Reframe

**Description:** Rewrites the input from a positive and constructive angle, removing negative framing without losing substantive content.

**System prompt:**
```
Reframe the text from a positive and constructive angle. Return only the reframed text.
```

**Acceptance criteria:**
- Negative or critical language is replaced with constructive equivalents (e.g., "fails to" → "has room to improve").
- No substantive information from the input is omitted — the reframe is neutral-to-positive, not dishonest.
- Output contains only the reframed text — no meta-commentary like "Here is a positive reframe:".
- Works on both first-person and third-person input without introducing grammatical errors.
- Enhancement is logged to SQLite with `mode = "reframe"`.

**Milestone:** v0.3

---

### 1.12 Custom

**Description:** Uses a user-supplied system prompt instead of any built-in prompt, allowing arbitrary AI instructions.

**System prompt:** User-provided string stored in `settingsStore` and passed as the `Custom(String)` variant to `build_prompt()`. The `build_prompt()` function returns the custom prompt directly as the system prompt without modification.

**Acceptance criteria:**
- User can enter any text (up to 2,000 characters) as their custom system prompt in Settings → Custom Mode.
- The custom prompt is stored in `settingsStore` and persists across app restarts.
- When Custom mode is active, the stored prompt is passed verbatim as the system field to the selected AI provider.
- Changing the custom prompt takes effect on the next enhancement request without requiring an app restart.
- Enhancement is logged to SQLite with `mode = "custom"`.

**Milestone:** v0.3

---

## 2. Cross-Cutting Features

### 2.1 Clipboard Capture

Reads the system clipboard contents and pre-populates the TextInput field when the enhance hotkey is pressed.

**Acceptance criteria:**
- Clipboard is read within 50 ms of the hotkey press event being received by the Rust process.
- Unicode text (including emoji, RTL characters, CJK) is preserved exactly — no corruption or encoding loss.
- Inputs up to 50,000 characters are accepted in full.
- Inputs exceeding 50,000 characters are truncated at the character boundary before 50,000 and a warning banner ("Text truncated at 50,000 characters") is shown in the overlay.
- No integration with the source application is required — clipboard capture works in any app on Windows, macOS, and Linux.
- On successful enhancement, the result text is automatically written to the system clipboard without requiring user action, so it is ready to paste immediately.
- On enhancement failure, the clipboard is not modified — the original clipboard content is preserved.

**Milestone:** v0.1

---

### 2.2 STT / Voice Dictation

Records audio from the system microphone, transcribes it, and populates the TextInput field for subsequent enhancement.

**Acceptance criteria:**
- Audio recording begins within 500 ms of the dictate hotkey press being received by the Rust process.
- For streaming-capable engines (Deepgram, AssemblyAI), partial transcripts appear in the TextInput field within 200 ms of each `stt://chunk` event being received by the frontend.
- Final transcript auto-populates the TextInput field on silence detection; silence threshold is 1.5 seconds of audio below −40 dBFS.
- In Privacy Mode (see §2.3), only `whisper_cpp` and `web_speech` are selectable as STT engines — no network STT requests are made during transcription.

**Milestone:** v0.2

---

### 2.3 Privacy Mode

Enforces fully offline operation by disabling all network-bound providers and STT engines.

**Acceptance criteria:**
- When Privacy Mode is enabled, zero outbound network requests are made during any enhancement or transcription operation (verifiable by inspecting system network traffic in QA).
- The provider selector in Settings is restricted to `ollama` and `custom` (pointing to localhost) only; all cloud providers are greyed out with a tooltip explaining the restriction.
- The STT engine selector is restricted to `whisper_cpp` and `web_speech` only.
- A green "Privacy Mode" badge is displayed in the overlay title bar and the system tray icon tooltip.
- The Privacy Mode setting persists across app restarts and is stored in the non-sensitive settings file (not the OS keychain).

**Milestone:** v0.5

---

### 2.4 Cost Tracking

Logs token usage and estimated cost for every enhancement request and provides a usage dashboard in Settings.

**Acceptance criteria:**
- Every completed enhancement request is written to the `usage_log` SQLite table with columns: `mode`, `provider`, `tokens`, `cost_usd`, `timestamp`, `input_len`, `output_len`. Write is fire-and-forget and does not add latency to the user-facing path.
- Settings → Usage tab displays the current month's total estimated cost in USD, updated on each tab open.
- Settings → Usage tab displays a per-provider breakdown (provider name, request count, total tokens, total cost) for the current month.
- Settings → Usage tab includes a "Export CSV" button that writes all `usage_log` rows to a user-chosen file path via the OS save dialog.
- Cost estimation uses per-provider token pricing constants defined in `cost/tracker.rs`; estimates are clearly labeled "estimated" in the UI.

**Milestone:** v0.7
