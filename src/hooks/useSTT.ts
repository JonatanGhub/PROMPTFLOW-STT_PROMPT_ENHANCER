import { tauriApi } from '@/lib/tauri'
import { useSessionStore } from '@/stores/sessionStore'
import { useSettingsStore } from '@/stores/settingsStore'

/** Voice dictation hook — full implementation in v0.2 sprint */
export function useSTT() {
  const setIsRecording = useSessionStore((s) => s.setIsRecording)
  const setInputText = useSessionStore((s) => s.setInputText)
  const isRecording = useSessionStore((s) => s.isRecording)
  const sttEngine = useSettingsStore((s) => s.sttEngine)

  const startRecording = async () => {
    setIsRecording(true)
    await tauriApi.startRecording(sttEngine)
  }

  const stopRecording = async () => {
    const transcript = await tauriApi.stopRecording()
    setInputText(transcript)
    setIsRecording(false)
  }

  return { startRecording, stopRecording, isRecording }
}
