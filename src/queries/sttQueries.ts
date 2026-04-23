import { useQuery } from '@tanstack/react-query'
import { tauriApi } from '@/lib/tauri'
import type { STTEngine } from '@/types'

/** Check if the given STT engine is available and its API key is set */
export function useSTTAvailability(engine: STTEngine) {
  return useQuery({
    queryKey: ['stt-availability', engine],
    queryFn: () => tauriApi.checkSttStatus(engine),
    staleTime: 60_000,
  })
}
