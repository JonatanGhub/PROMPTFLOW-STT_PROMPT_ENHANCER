import { useEffect, useCallback } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useEnhancement } from '@/hooks/useEnhancement'
import { OverlayWindow } from '@/components/overlay/OverlayWindow'
import { SettingsWindow } from '@/components/settings/SettingsWindow'
import { tauriApi } from '@/lib/tauri'
import type { AIProvider } from '@/types'

/** Providers active in v0.1 — used to pre-check keychain on mount */
const V01_PROVIDERS: readonly AIProvider[] = ['openai', 'groq']

export default function App() {
  const overlayVisible = useUIStore((s) => s.overlayVisible)
  const settingsVisible = useUIStore((s) => s.settingsVisible)
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey)

  // Pre-check keychain so ApiKeyInput shows the correct initial state
  useEffect(() => {
    for (const provider of V01_PROVIDERS) {
      tauriApi.hasApiKey(provider)
        .then((has) => setHasApiKey(provider, has))
        .catch(console.error)
    }
  }, [setHasApiKey])

  // Sync Tauri window visibility with the React store
  useEffect(() => {
    const win = getCurrentWindow()
    if (overlayVisible || settingsVisible) {
      win.show().catch(console.error)
    } else {
      win.hide().catch(console.error)
    }
  }, [overlayVisible, settingsVisible])

  // Subscribe to hotkey events emitted by the Rust backend
  useHotkeys()

  const { enhance } = useEnhancement()
  // Stable reference so OverlayWindow doesn't re-render on every parent update
  const handleEnhance = useCallback(() => { enhance() }, [enhance])

  return (
    <>
      {overlayVisible && !settingsVisible && (
        <OverlayWindow onEnhance={handleEnhance} />
      )}
      {settingsVisible && (
        <SettingsWindow />
      )}
    </>
  )
}
