import { useState, useEffect, useCallback } from 'react'
import type { AIProvider } from '@/types'
import { tauriApi } from '@/lib/tauri'
import { useSettingsStore } from '@/stores/settingsStore'

interface UseApiKeyResult {
  hasKey: boolean
  isSaving: boolean
  saveKey: (key: string) => Promise<void>
  deleteKey: () => Promise<void>
  error: string | null
}

export function useApiKey(provider: AIProvider): UseApiKeyResult {
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey)
  const storeHasKey = useSettingsStore((s) => s.hasApiKey[provider])

  const [hasKey, setHasKey] = useState(storeHasKey)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check keychain on mount and when provider changes
  useEffect(() => {
    let cancelled = false
    tauriApi.hasApiKey(provider)
      .then((result) => {
        if (!cancelled) {
          setHasKey(result)
          setHasApiKey(provider, result)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      })
    return () => { cancelled = true }
  }, [provider, setHasApiKey])

  const saveKey = useCallback(async (key: string) => {
    setIsSaving(true)
    setError(null)
    try {
      await tauriApi.saveApiKey(provider, key)
      setHasKey(true)
      setHasApiKey(provider, true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }, [provider, setHasApiKey])

  const deleteKey = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    try {
      await tauriApi.deleteApiKey(provider)
      setHasKey(false)
      setHasApiKey(provider, false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }, [provider, setHasApiKey])

  return { hasKey, isSaving, saveKey, deleteKey, error }
}
