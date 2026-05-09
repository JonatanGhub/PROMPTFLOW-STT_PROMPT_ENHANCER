import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'

/**
 * Subscribes to backend `hotkey://enhance` events emitted when the OS hotkey fires.
 *
 * The global hotkey (Ctrl+Shift+E / Cmd+Shift+E) is registered in Rust at startup
 * (src-tauri/src/lib.rs `.setup()`). When it fires, Rust reads the clipboard and
 * emits `hotkey://enhance` with the captured text as payload.
 *
 * This hook:
 *  1. Populates `inputText` with the clipboard payload
 *  2. Clears previous `outputText` and `errorMessage`
 *  3. Shows the overlay window via `overlayVisible`
 *
 * Cleanup: the Tauri listener is removed on unmount to prevent memory leaks.
 */
export function useHotkeys() {
  const setOverlayVisible = useUIStore((s) => s.setOverlayVisible)
  const clearError = useUIStore((s) => s.clearError)
  const setInputText = useSessionStore((s) => s.setInputText)
  const setOutputText = useSessionStore((s) => s.setOutputText)

  useEffect(() => {
    const unlistenPromise = listen<string>('hotkey://enhance', (event) => {
      setInputText(event.payload)
      setOutputText('')
      clearError()
      setOverlayVisible(true)
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten()).catch(console.error)
    }
  }, [setOverlayVisible, clearError, setInputText, setOutputText])
}
