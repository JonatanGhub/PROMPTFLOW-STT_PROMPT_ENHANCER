import { useRef, useEffect, KeyboardEvent } from 'react'
import { isMac } from '@/lib/platform'

const CHAR_WARN_THRESHOLD = 45000
const CHAR_MAX = 50000
const CHAR_RED_THRESHOLD = 49000

interface TextInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function TextInput({ value, onChange, onSubmit, disabled }: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const modifierHeld = isMac ? e.metaKey : e.ctrlKey
    if (modifierHeld && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  const showCounter = value.length >= CHAR_WARN_THRESHOLD
  const counterRed = value.length >= CHAR_RED_THRESHOLD

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Paste or type text…"
        maxLength={CHAR_MAX}
        className={[
          'resize-none min-h-[56px] max-h-[120px] overflow-y-auto',
          'bg-input border border-border rounded-[var(--radius)]',
          'text-base w-full p-2',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />
      {showCounter && (
        <span
          className={[
            'absolute bottom-2 right-2 text-xs pointer-events-none',
            counterRed ? 'text-destructive' : 'text-muted-foreground',
          ].join(' ')}
        >
          {value.length.toLocaleString()} / {CHAR_MAX.toLocaleString()}
        </span>
      )}
    </div>
  )
}
