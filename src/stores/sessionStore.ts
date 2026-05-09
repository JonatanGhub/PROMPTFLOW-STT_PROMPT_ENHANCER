import { create } from 'zustand'

interface SessionState {
  inputText: string
  outputText: string
  isRecording: boolean
  setInputText: (t: string) => void
  setOutputText: (t: string) => void
  setIsRecording: (v: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  inputText: '',
  outputText: '',
  isRecording: false,
  setInputText: (inputText) => set({ inputText }),
  setOutputText: (outputText) => set({ outputText }),
  setIsRecording: (isRecording) => set({ isRecording }),
  // reset clears per-session content; selected mode (in settingsStore) persists
  reset: () => set({ inputText: '', outputText: '', isRecording: false }),
}))
