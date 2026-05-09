import { useState, useEffect, useCallback } from 'react'
import type { AIProvider } from '@/types'
import { tauriApi } from '@/lib/tauri'
import { useSettingsStore } from '@/stores/settingsStore'

interface UseApiKeyResult {
  /** True if a key exists in the OS keychain for this provider. Derived from store — always in sync. */
  hasKey: boolean
  /** True while a save operation is in progress. */
  isSaving: boolean
  /** True while a delete operation is in progress. */
  isDeleting: boolean
  saveKey: (key: string) => Promise<void>
  deleteKey: () => Promise<void>
  error: string | null
}

export function useApiKey(provider: AIProvider): UseApiKeyResult {
  const setHasApiKey = useSettingsStore((s) => s.setHasApiKey)
  // Derive hasKey directly from the store so external writes stay in sync
  const hasKey = useSettingsStore((s) => s.hasApiKey[provider])

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check keychain on mount and when provider changes
  useEffect(() => {
    let cancelled = false
    setError(null)  // Clear stale error from previous provider
    tauriApi.hasApiKey(provider)
      .then((result) => {
        if (!cancelled) setHasApiKey(provider, result)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => { cancelled = true }
  }, [provider, setHasApiKey])

  const saveKey = useCallback(async (key: string) => {
    setIsSaving(true)
    setError(null)
    try {
      await tauriApi.saveApiKey(provider, key)
      setHasApiKey(provider, true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      throw e  // Re-throw so the caller (ApiKeyInput) knows it failed
    } finally {
      setIsSaving(false)
    }
  }, [provider, setHasApiKey])

  const deleteKey = useCallback(async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await tauriApi.deleteApiKey(provider)
      setHasApiKey(provider, false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsDeleting(false)
    }
  }, [provider, setHasApiKey])

  return { hasKey, isSaving, isDeleting, saveKey, deleteKey, error }
}
