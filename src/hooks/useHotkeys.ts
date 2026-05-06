import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { tauriApi } from '@/lib/tauri'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Registers global hotkeys on mount and subscribes to backend-emitted events.
 *
 * ⚠️ CALLER MUST stabilize `onEnhance` and `onDictate` with `useCallback` to avoid
 * re-registering hotkeys on every render. Unstable function references will cause
 * the useEffect to re-run on each render, unregistering and re-registering the OS
 * hotkeys repeatedly.
 *
 * Flow:
 * 1. Calls register_hotkey for each binding (tauri-plugin-global-shortcut)
 * 2. Listens for `hotkey://enhance` and `hotkey://dictate` events emitted by Rust
 *    when the OS hotkey fires (the plugin fires to Rust, Rust re-emits to frontend)
 * 3. Unregisters and removes listeners on unmount
 */
export function useHotkeys(
  onEnhance: () => void,
  onDictate: () => void
) {
  const hotkeyEnhance = useSettingsStore((s) => s.hotkeyEnhance)
  const hotkeyDictate = useSettingsStore((s) => s.hotkeyDictate)

  useEffect(() => {
    // Register OS-level hotkeys
    tauriApi.registerHotkey('enhance', hotkeyEnhance).catch(console.error)
    tauriApi.registerHotkey('dictate', hotkeyDictate).catch(console.error)

    // Listen for backend-emitted events when hotkeys fire
    const unlistenEnhance = listen('hotkey://enhance', onEnhance)
    const unlistenDictate = listen('hotkey://dictate', onDictate)

    return () => {
      tauriApi.unregisterHotkey('enhance').catch(console.error)
      tauriApi.unregisterHotkey('dictate').catch(console.error)
      unlistenEnhance.then((fn) => fn())
      unlistenDictate.then((fn) => fn())
    }
  }, [hotkeyEnhance, hotkeyDictate, onEnhance, onDictate])
}
