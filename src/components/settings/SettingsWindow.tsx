import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { ApiKeyInput } from './ApiKeyInput'

export function SettingsWindow() {
  const provider = useSettingsStore((s) => s.provider)
  const setProvider = useSettingsStore((s) => s.setProvider)
  const setSettingsVisible = useUIStore((s) => s.setSettingsVisible)

  return (
    <div
      className="w-[480px] min-h-[320px] bg-background border border-border rounded-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col"
      role="dialog"
      aria-label="PromptFlow settings"
    >
      {/* Header */}
      <div className="h-8 w-full flex items-center justify-between px-3 shrink-0 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Settings</span>
        <button
          type="button"
          onClick={() => setSettingsVisible(false)}
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
            {(['openai', 'groq'] as const).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value={p}
                  checked={provider === p}
                  onChange={() => setProvider(p)}
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
