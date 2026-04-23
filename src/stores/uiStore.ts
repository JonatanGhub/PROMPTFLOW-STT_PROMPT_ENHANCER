import { create } from 'zustand'

interface UIState {
  overlayVisible: boolean
  isLoading: boolean
  errorMessage: string | null
  setOverlayVisible: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setError: (msg: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  overlayVisible: false,
  isLoading: false,
  errorMessage: null,
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (errorMessage) => set({ errorMessage }),
}))
