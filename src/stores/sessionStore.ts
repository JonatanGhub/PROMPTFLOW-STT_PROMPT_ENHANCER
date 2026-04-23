import { create } from 'zustand'
import type { EnhancementMode } from '@/types'

interface SessionState {
  inputText: string
  outputText: string
  activeMode: EnhancementMode
  isRecording: boolean
  setInputText: (t: string) => void
  setOutputText: (t: string) => void
  setActiveMode: (m: EnhancementMode) => void
  setIsRecording: (v: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  inputText: '',
  outputText: '',
  activeMode: 'fix_grammar',
  isRecording: false,
  setInputText: (inputText) => set({ inputText }),
  setOutputText: (outputText) => set({ outputText }),
  setActiveMode: (activeMode) => set({ activeMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  reset: () => set({ inputText: '', outputText: '', isRecording: false }),
}))
