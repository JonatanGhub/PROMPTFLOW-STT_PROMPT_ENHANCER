# UI/UX — PromptFlow STT

## 1. Design Principles

**Overlay-first.** The overlay appears instantly on hotkey press and dismisses instantly on Esc or a click outside its bounds. Every millisecond of perceived latency between the hotkey and a visible, interactive window is a UX failure.

**Dark-only.** PromptFlow STT is designed for dark overlays placed on top of whatever the user is working in — often bright document editors or browsers. There is no light mode. Attempting to add one is explicitly out of scope.

**Keyboard-first.** Every action is reachable without a mouse. Tab navigates between interactive elements in a predictable order. Arrow keys navigate within compound controls (mode selector). Enter and Ctrl+Enter trigger primary actions. Esc dismisses.

**Minimal chrome.** The text being processed and the result are the UI. Window decorations, borders, and control surfaces are invisible or recede visually. The violet accent color is used sparingly — only for active states and the focus ring — so it draws the eye to what matters.

---

## 2. Color Tokens

All values are defined in `src/index.css` as CSS custom properties on `:root`. Components reference tokens via Tailwind utility classes (`bg-background`, `text-foreground`, etc.); no hardcoded hex or RGB values appear in component files.

| Token | HSL value | Description |
|---|---|---|
| `--background` | `222 47% 11%` | Main overlay window background. Deep dark blue — dark enough to recede behind content but not pure black, which looks harsh on dark screens. |
| `--foreground` | `210 40% 98%` | Primary text color. Near-white with a slight cool tint to match the blue background. Used for all body text and headings. |
| `--border` | `217 33% 17%` | Subtle divider color for section borders, card edges, and input field outlines. Slightly lighter than `--background` — visible but not distracting. |
| `--input` | `217 33% 17%` | Input field background. Matches `--border` deliberately so text areas feel inset without requiring an additional border on both sides. |
| `--ring` | `263 70% 60%` | Focus ring color. Violet — matches `--primary` so focused elements share the brand accent color. Width: 2px offset ring. |
| `--primary` | `263 70% 60%` | Brand violet. Used for primary action buttons, the active mode pill background, and the focus ring. High saturation makes it the strongest visual signal in the interface. |
| `--primary-foreground` | `210 40% 98%` | Text color on `--primary` backgrounds. Near-white, identical to `--foreground`, providing sufficient contrast on the violet background. |
| `--secondary` | `217 33% 17%` | Secondary button and hover-state background. Same value as `--border` and `--input` — creates a subtle lift when used as a hover target against `--background`. |
| `--secondary-foreground` | `210 40% 98%` | Text on `--secondary` backgrounds. Near-white. |
| `--muted` | `217 33% 17%` | Muted element backgrounds (disabled states, inactive sections). Same family as `--secondary`. |
| `--muted-foreground` | `215 20% 65%` | Placeholder text, labels, captions, and de-emphasized copy. Lower lightness than `--foreground` to visually subordinate supporting information. |
| `--accent` | `263 70% 60%` | Accent color for highlights and icon fills where `--primary` would be too heavy. Same value as `--primary` — ensures visual consistency of the violet accent language across the interface. |
| `--accent-foreground` | `210 40% 98%` | Text on `--accent` backgrounds. Near-white. |
| `--destructive` | `0 84% 60%` | Error state and delete action color. Saturated red — immediately distinguishable from the violet primary even by users with deuteranopia (red-green color blindness), because the hue angle is 263° away from violet. |
| `--destructive-foreground` | `210 40% 98%` | Text on `--destructive` backgrounds. Near-white. |
| `--radius` | `0.5rem` | Base border radius (8px at default font size). Applied to all interactive elements: inputs, buttons, pills, and the overlay window itself uses `12px` (1.5× base) for the outer container. |

---

## 3. Typography

**Font stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

System fonts are used exclusively. No web fonts are loaded — this eliminates a network dependency, avoids FOUT (flash of unstyled text), and keeps the binary size and startup time minimal. The stack resolves to San Francisco on macOS/iOS, Segoe UI on Windows, and Roboto on Android/Linux.

**Size scale:**

| Size | Usage |
|---|---|
| 12px | Labels, captions, keyboard shortcut badges, character counter |
| 14px | Body text, button labels, mode pill labels |
| 16px | TextInput and TextOutput content — slightly larger for comfortable reading at arm's length |
| 20px | Section headings within Settings, OnboardingWizard step titles |

**Line heights:**
- Body text (12px, 14px, 16px): `1.4` — sufficient for comfortable multi-line reading in a narrow 480px container.
- Headings (20px): `1.2` — tighter spacing appropriate for short display text.

**Font weights:**
- `400` — body text, TextInput/TextOutput content.
- `500` — labels, captions, secondary control text.
- `600` — button labels, headings, keyboard shortcut labels.

---

## 4. Component Specs

### OverlayWindow

The root container for the main floating interface. Managed by `src/components/overlay/OverlayWindow.tsx`.

- **Size:** 480×320px, fixed. Not resizable (`resizable: false` in `tauri.conf.json`).
- **Position:** Centered on the primary display at first launch. After the user drags it, the position is saved to `settingsStore` and restored on subsequent launches.
- **Border:** 1px solid `hsl(var(--border))`, `border-radius: 12px` (1.5× base `--radius`).
- **Shadow:** `box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5)` — heavy shadow ensures the overlay is visually distinct from bright application windows behind it.
- **Background:** `hsl(var(--background))`.
- **Drag region:** The top 32px of the window functions as a drag handle. This area contains no interactive controls. On macOS the window is draggable via Tauri's `data-tauri-drag-region` attribute on this element.
- **Dismiss:** Pressing Esc closes the overlay (`overlayVisible = false` in `uiStore`). Clicking outside the 480×320 window bounds also closes it (Tauri window blur event triggers hide).
- **Transparency:** Tauri window is configured with `transparent: true` to allow the `border-radius` and `box-shadow` to render correctly without a rectangular native border.

---

### ModeSelector

A horizontally scrollable row of mode pills. Managed by `src/components/overlay/ModeSelector.tsx`.

- **Layout:** Single horizontal row. Overflow scrolls horizontally — no wrapping. Scrollbar hidden (CSS `scrollbar-width: none`) but scrollable via keyboard or touch.
- **Count:** 12 pills, one per `EnhancementMode`. Labels are the mode name in sentence case (e.g., "Fix grammar", "Action items", "Code review").
- **Active pill:** Background `hsl(var(--primary))`, text color `hsl(var(--primary-foreground))`, `border-radius: var(--radius)`.
- **Inactive pill:** Background transparent, text color `hsl(var(--muted-foreground))`. On hover: background `hsl(var(--secondary))`, text color `hsl(var(--secondary-foreground))`.
- **Keyboard navigation:** Left/Right arrow keys move focus between pills. Enter or Space selects the focused pill and updates `settingsStore.selectedMode`. Tab moves focus out of the ModeSelector to the next focusable element.
- **Padding:** 4px vertical, 12px horizontal per pill. 6px gap between pills.

---

### TextInput

A resizable textarea for clipboard-populated or manually typed input text. Managed by `src/components/overlay/TextInput.tsx`.

- **Element:** `<textarea>` with `resize: none` (CSS-controlled auto-resize).
- **Auto-resize:** Height grows automatically from a minimum of 56px up to 120px as content is added. Beyond 120px, the element scrolls internally (CSS `overflow-y: auto`).
- **Placeholder:** `"Paste or type text…"` — color `hsl(var(--muted-foreground))`.
- **Styling:** Background `hsl(var(--input))`, border `1px solid hsl(var(--border))`, `border-radius: var(--radius)`, font-size 16px.
- **Submit shortcut:** `Ctrl+Enter` on Windows/Linux or `Cmd+Enter` on macOS triggers the enhancement action (same as clicking Enhance in the ActionBar). This shortcut is shown as a badge label on the Enhance button.
- **Character counter:** Shown in the bottom-right corner of the TextInput when the input length is within 5,000 characters of the 50,000-character limit (i.e., when `inputText.length >= 45000`). Format: `"45,231 / 50,000"`. Color: `hsl(var(--muted-foreground))` until 49,000 characters, then `hsl(var(--destructive))`.
- **Focus:** Receives focus automatically when the overlay becomes visible.

---

### TextOutput

A read-only display area for the AI-enhanced result. Managed by `src/components/overlay/TextOutput.tsx`.

- **Element:** `<div role="textbox" aria-readonly="true">` styled identically to TextInput for visual consistency.
- **Styling:** Background `hsl(var(--input))`, border `1px solid hsl(var(--border))`, `border-radius: var(--radius)`, font-size 16px, `min-height: 56px`, `max-height: 120px`, `overflow-y: auto`.
- **Appearance animation:** When result text is set, the element transitions from `opacity: 0` to `opacity: 1` over 200ms (`transition: opacity 200ms ease-in`).
- **Copy button:** Positioned in the top-right corner of the TextOutput container. Icon: clipboard SVG at 16×16px. On click: copies `outputText` to the system clipboard via `write_clipboard`. After click: button label changes to "Copied!" for 1,500 ms then reverts to the clipboard icon.
- **Empty state:** When `outputText` is empty, displays the placeholder text "Enhancement result will appear here" in `hsl(var(--muted-foreground))`.

---

### ActionBar

A row of three action buttons below the TextInput/TextOutput area. Managed by `src/components/overlay/ActionBar.tsx`.

- **Layout:** Three buttons in a horizontal row, left-aligned. Button heights are 36px.
- **Enhance (primary button):** Background `hsl(var(--primary))`, text `hsl(var(--primary-foreground))`, font-weight 600. Keyboard shortcut badge shows `⌘↵` on macOS or `Ctrl↵` on Windows/Linux in a 12px muted label to the right of the button text. During an active enhancement request: button is disabled and displays a 16px spinner animation in place of the label.
- **Copy Result (secondary button):** Background `hsl(var(--secondary))`, text `hsl(var(--secondary-foreground))`. Copies `outputText` to the clipboard via `write_clipboard`, identical behavior to the copy button on TextOutput. Disabled when `outputText` is empty.
- **Clear (ghost button):** No background, no border. Text color `hsl(var(--muted-foreground))`. On hover: text color `hsl(var(--foreground))`. On click: clears both `sessionStore.inputText` and `sessionStore.outputText`, resets any error banners in `uiStore`.
- **Button gap:** 8px between buttons.

---

## 5. Screen Flows

### First-Run Onboarding

Displayed when the app launches and no AI provider key is present in the OS keychain.

```
App launch (first time — no API key in keychain)
  │
  └─► OnboardingWizard appears (full overlay, 480×400px, centered)
        Step indicator: ●  ○  ○   (1 of 3)
        │
        ├─► Step 1: Choose AI provider
        │     ProviderSelector dropdown (default: openai)
        │     API key input field (masked, type=password)
        │     "Test connection" button
        │       ├─► [Success] Green status dot + "Connected" label
        │       └─► [Failure] Red status dot + error message
        │     "Next →" button (enabled only after successful test)
        │
        ├─► Step 2: Set hotkeys
        │     Step indicator: ○  ●  ○   (2 of 3)
        │     HotkeyPicker for "Enhance" (default: Cmd/Ctrl+Shift+E)
        │     HotkeyPicker for "Dictate" (default: Cmd/Ctrl+Shift+D)
        │     Live conflict warning if hotkey is already registered by OS or another app
        │     "← Back"  "Next →" buttons
        │
        └─► Step 3: Quick test
              Step indicator: ○  ○  ●   (3 of 3)
              TextInput pre-filled with example text: "hello world this is a test"
              ModeSelector with Fix Grammar pre-selected
              "Enhance now" button
                ├─► [Success] TextOutput shows corrected text
                │   "All set! →" button → closes wizard, shows main overlay
                └─► [Failure] Error banner + "Try again" button
```

---

### Enhancement Flow (clipboard capture)

The primary use case: user is in any app, invokes PromptFlow STT via hotkey.

```
User working in any application
  │
  ├─► Presses enhance hotkey (e.g., Ctrl+Shift+E)
  │     Rust: global-shortcut callback fires
  │     Rust: emits hotkey://enhance event to frontend
  │     Rust: reads clipboard text
  │
  ├─► Overlay window becomes visible (alwaysOnTop: true)
  │     TextInput pre-populated with clipboard text
  │     ModeSelector shows previously selected mode (persisted)
  │     TextOutput shows empty state placeholder
  │
  ├─► User optionally selects a different mode (arrow keys or click)
  │
  ├─► User presses Ctrl+Enter (or Cmd+Enter) / clicks Enhance button
  │     Enhance button shows spinner, becomes disabled
  │     useEnhanceMutation calls invoke('enhance_text', {text, mode, provider})
  │
  ├─► Rust processes request:
  │     enhancement::build_prompt() constructs (system, user) pair
  │     providers::<active>::complete() calls AI API
  │     usage_log written to SQLite (background task)
  │     EnhanceResponse returned to frontend
  │
  ├─► [Success path]
  │     TextOutput fades in with result text (200ms opacity transition)
  │     Enhance button re-enables
  │     write_clipboard() called automatically — result ready to paste
  │     User clicks "Copy Result" or presses Esc to dismiss
  │
  └─► [Error path]
        Error banner appears below ActionBar (aria-live="polite")
        Banner shows error message from AppError.message
        Enhance button re-enables
        User can edit input and retry
```

---

### STT / Dictation Flow

User invokes dictation hotkey to transcribe speech into the TextInput.

```
User presses and holds dictate hotkey (e.g., Ctrl+Shift+D)
  │
  ├─► Overlay window becomes visible
  │     Recording status badge appears in overlay title bar:
  │       ● pulsing red dot + "Recording…" label
  │
  ├─► useSTT.start() calls invoke('start_recording', {engine})
  │     Rust: audio::capture opens microphone (cpal, 16 kHz mono)
  │     Rust: audio::vad begins monitoring RMS energy
  │
  ├─► User speaks
  │     [Streaming engine — Deepgram / AssemblyAI]
  │       Rust emits stt://chunk events with partial transcript
  │       Frontend appends partial text to TextInput in real time
  │     [Batch engine — whisper_api / whisper_cpp / Google / Azure]
  │       TextInput shows "Transcribing…" placeholder while recording
  │
  ├─► Silence detected (1.5s below −40 dBFS) OR user releases hotkey
  │     audio::vad signals capture task to stop
  │     Final audio flushed to STT engine
  │     Rust emits stt://done with final transcript text
  │
  ├─► Frontend receives stt://done
  │     TextInput populated with final transcript text
  │     Recording badge removed
  │     isRecording flag cleared
  │
  └─► User reviews transcript
        ├─► User selects enhancement mode → Ctrl+Enter → Enhancement flow
        └─► User edits transcript manually before enhancing
```

---

## 6. Accessibility

**Keyboard navigation order (Tab sequence within overlay):**
`ModeSelector (first pill)` → `TextInput` → `Enhance button` → `Copy Result button` → `Clear button` → `Copy button (TextOutput)` → wraps back to `ModeSelector`.

**Focus visibility:** All interactive elements show a 2px solid `hsl(var(--ring))` focus ring with 2px offset when focused via keyboard. No element suppresses the focus indicator with `outline: none` without providing an equivalent visible alternative.

**Error announcements:** A hidden `<div role="status" aria-live="polite" aria-atomic="true">` region in `OverlayWindow` receives error messages from `uiStore.errorMessage`. Screen readers announce error text within 1 second of it appearing without requiring the user to navigate to the error banner.

**Overlay dismissal:** Pressing Esc closes the overlay from any focus state — including while TextInput has focus — without requiring the user to be focused on a specific close button.

**No color-only information:** All error states combine color (red `--destructive`) with an icon (⚠ triangle SVG) and text message. Status indicators (recording, privacy mode) combine color with a text label. Users with color blindness receive the same information as sighted users.

**Minimum contrast:** All text/background pairings in the color token set meet WCAG 2.1 AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text):
- `--foreground` (`210 40% 98%`) on `--background` (`222 47% 11%`): approximately 14:1 — AAA.
- `--primary-foreground` on `--primary`: approximately 5:1 — AA.
- `--muted-foreground` (`215 20% 65%`) on `--background`: approximately 4.6:1 — AA.
