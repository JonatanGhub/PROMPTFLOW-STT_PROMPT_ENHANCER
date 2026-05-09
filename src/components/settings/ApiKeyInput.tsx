import { useState } from 'react'
import type { AIProvider } from '@/types'
import { useApiKey } from '@/hooks/useApiKey'

interface ApiKeyInputProps {
  provider: AIProvider
}

export function ApiKeyInput({ provider }: ApiKeyInputProps) {
  const { hasKey, isSaving, saveKey, deleteKey, error } = useApiKey(provider)
  const [inputValue, setInputValue] = useState('')
  const [isChanging, setIsChanging] = useState(false)

  const handleSave = async () => {
    if (!inputValue.trim()) return
    await saveKey(inputValue.trim())
    setInputValue('')
    setIsChanging(false)
  }

  const handleRemove = async () => {
    await deleteKey()
  }

  const showInput = !hasKey || isChanging

  return (
    <div className="flex flex-col gap-2">
      {showInput ? (
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSave()
              }
            }}
            placeholder="Enter API key…"
            className="flex-1 h-8 px-2 text-sm bg-input border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => { void handleSave() }}
            disabled={isSaving || !inputValue.trim()}
            className="h-8 px-3 text-sm bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          {isChanging && (
            <button
              type="button"
              onClick={() => setIsChanging(false)}
              className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm text-muted-foreground font-mono tracking-widest">
            ●●●●●●●●●●●●
          </span>
          <button
            type="button"
            onClick={() => setIsChanging(true)}
            className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-[var(--radius)] transition-colors"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => { void handleRemove() }}
            disabled={isSaving}
            className="h-8 px-3 text-sm text-destructive hover:text-destructive/80 border border-border rounded-[var(--radius)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Removing…' : 'Remove'}
          </button>
        </div>
      )}

      {error && (
        <span className="text-destructive text-xs">{error}</span>
      )}
    </div>
  )
}
