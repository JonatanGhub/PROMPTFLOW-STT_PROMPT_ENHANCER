const isMac = navigator.platform.includes('Mac')
const SHORTCUT_LABEL = isMac ? '⌘↵' : 'Ctrl↵'

interface ActionBarProps {
  onEnhance: () => void
  onCopy: () => void
  onClear: () => void
  isLoading: boolean
  hasOutput: boolean
}

export function ActionBar({ onEnhance, onCopy, onClear, isLoading, hasOutput }: ActionBarProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      {/* Enhance button */}
      <button
        onClick={onEnhance}
        disabled={isLoading}
        aria-label="Enhance text"
        className="flex items-center bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-[var(--radius)] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <svg
            className="animate-spin mr-2"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        Enhance
        <span className="text-xs text-primary-foreground/60 ml-2">{SHORTCUT_LABEL}</span>
      </button>

      {/* Copy Result button */}
      <button
        onClick={onCopy}
        disabled={!hasOutput}
        aria-label="Copy result"
        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-[var(--radius)] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Copy Result
      </button>

      {/* Clear button */}
      <button
        onClick={onClear}
        aria-label="Clear"
        className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm transition-colors"
      >
        Clear
      </button>
    </div>
  )
}
