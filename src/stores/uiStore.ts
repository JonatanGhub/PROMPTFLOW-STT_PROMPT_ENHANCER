import { create } from 'zustand'

interface UIState {
  overlayVisible: boolean
  isLoading: boolean
  errorMessage: string | null
  settingsVisible: boolean
  setOverlayVisible: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  setSettingsVisible: (v: boolean) => void
  clearError: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  overlayVisible: false,
  isLoading: false,
  errorMessage: null,
  settingsVisible: false,
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (errorMessage) => set({ errorMessage }),
  setSettingsVisible: (settingsVisible) => set({ settingsVisible }),
  clearError: () => set({ errorMessage: null }),
}))
