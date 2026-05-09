import { useMutation } from '@tanstack/react-query'
import { tauriApi } from '@/lib/tauri'
import { useSessionStore } from '@/stores/sessionStore'
import { useUIStore } from '@/stores/uiStore'
import type { EnhancementMode, AIProvider } from '@/types'

export function useEnhanceMutation() {
  const setOutputText = useSessionStore((s) => s.setOutputText)
  const setIsLoading = useUIStore((s) => s.setIsLoading)
  const setError = useUIStore((s) => s.setError)

  return useMutation({
    mutationFn: ({
      text,
      mode,
      provider,
    }: {
      text: string
      mode: EnhancementMode
      provider: AIProvider
    }) => tauriApi.enhanceText(text, mode, provider),
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: (data) => {
      setOutputText(data.result)
      // Auto-write result to clipboard so the user can paste immediately
      tauriApi.writeClipboard(data.result).catch(console.error)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })
}
