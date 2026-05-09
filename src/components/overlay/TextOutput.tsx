import { useState } from 'react'
import { tauriApi } from '@/lib/tauri'

const COPIED_RESET_MS = 1500

interface TextOutputProps {
  value: string
}

export function TextOutput({ value }: TextOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    await tauriApi.writeClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_RESET_MS)
  }

  return (
    <div className="relative min-h-[56px] max-h-[120px] overflow-y-auto bg-input border border-border rounded-[var(--radius)] p-2">
      <div
        role="textbox"
        aria-readonly="true"
        aria-label="Enhancement result"
        className={[
          'text-base pr-8',
          value
            ? 'text-foreground transition-opacity duration-200 opacity-100'
            : 'text-muted-foreground',
        ].join(' ')}
      >
        {value || 'Enhancement result will appear here'}
      </div>

      {value && (
        <button
          onClick={() => { void handleCopy() }}
          aria-label={copied ? 'Copied!' : 'Copy result'}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <span className="text-xs">Copied!</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
