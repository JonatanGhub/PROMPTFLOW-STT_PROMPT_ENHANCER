import { useCallback } from 'react'
import type { AIProvider } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { ApiKeyInput } from './ApiKeyInput'

const V01_PROVIDERS = ['openai', 'groq'] as const satisfies readonly AIProvider[]

export function SettingsWindow() {
  const rawProvider = useSettingsStore((s) => s.provider)
  const setProvider = useSettingsStore((s) => s.setProvider)
  const setSettingsVisible = useUIStore((s) => s.setSettingsVisible)
  const setOverlayVisible = useUIStore((s) => s.setOverlayVisible)

  const handleClose = useCallback(() => {
    setSettingsVisible(false)
    setOverlayVisible(true) // go back to overlay instead of hiding the window
  }, [setSettingsVisible, setOverlayVisible])

  // Guard against stale persisted provider outside the v0.1 two-value set
  const provider: (typeof V01_PROVIDERS)[number] = (V01_PROVIDERS as readonly string[]).includes(rawProvider)
    ? rawProvider as (typeof V01_PROVIDERS)[number]
    : 'openai'

  const handleProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProvider(e.target.value as AIProvider)
    },
    [setProvider],
  )

  return (
    <div
      className="w-[480px] min-h-[320px] bg-background border border-border rounded-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col"
      role="dialog"
      aria-label="PromptFlow settings"
      aria-modal="true"
    >
      {/* Header — drag region so the window is moveable */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <div data-tauri-drag-region className="h-8 w-full flex items-center justify-between px-3 shrink-0 border-b border-border">
        <span className="text-sm font-semibold text-foreground select-none" data-tauri-drag-region>Settings</span>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* Provider section */}
        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">AI Provider</h2>
          <div className="flex flex-col gap-1">
            {V01_PROVIDERS.map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value={p}
                  checked={provider === p}
                  onChange={handleProviderChange}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">
                  {p === 'openai' ? 'OpenAI (gpt-4o-mini)' : 'Groq (llama-3.1-8b-instant, free)'}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* API Key section */}
        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">
            API Key — {provider}
          </h2>
          <ApiKeyInput provider={provider} />
        </section>
      </div>
    </div>
  )
}
