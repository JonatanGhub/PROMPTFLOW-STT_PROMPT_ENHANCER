import { useRef, KeyboardEvent } from 'react'
import type { EnhancementMode } from '@/types'
import { useSessionStore } from '@/stores/sessionStore'

export const V01_MODES = ['fix_grammar', 'formalize', 'shorten'] as const satisfies readonly EnhancementMode[]

const MODE_LABELS: Record<typeof V01_MODES[number], string> = {
  fix_grammar: 'Fix grammar',
  formalize: 'Formalize',
  shorten: 'Shorten',
}

interface ModeSelectorProps {
  modes: readonly EnhancementMode[]
}

export function ModeSelector({ modes }: ModeSelectorProps) {
  const activeMode = useSessionStore((s) => s.activeMode)
  const setActiveMode = useSessionStore((s) => s.setActiveMode)
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = pillRefs.current[(index + 1) % modes.length]
      next?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = pillRefs.current[(index - 1 + modes.length) % modes.length]
      prev?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveMode(modes[index])
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Enhancement mode"
      className="flex flex-row gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      {modes.map((mode, index) => {
        const isActive = mode === activeMode
        const label = MODE_LABELS[mode as typeof V01_MODES[number]] ?? mode
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={isActive}
            ref={(el) => { pillRefs.current[index] = el }}
            onClick={() => setActiveMode(mode)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              'py-1 px-3 text-sm whitespace-nowrap shrink-0 rounded-[var(--radius)] transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
