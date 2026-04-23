import { invoke } from '@tauri-apps/api/core'
import type { EnhanceResponse, Settings, STTStatus } from '@/types'

export const tauriApi = {
  enhanceText: (text: string, mode: string, provider: string) =>
    invoke<EnhanceResponse>('enhance_text', { text, mode, provider }),

  startRecording: (engine: string) =>
    invoke<void>('start_recording', { engine }),

  stopRecording: () =>
    invoke<string>('stop_recording'),

  checkSttStatus: (engine: string) =>
    invoke<STTStatus>('check_stt_status', { engine }),

  getSettings: () =>
    invoke<Settings>('get_settings'),

  setSettings: (settings: Settings) =>
    invoke<void>('set_settings', { settings }),

  registerHotkey: (id: string, shortcut: string) =>
    invoke<void>('register_hotkey', { id, shortcut }),

  unregisterHotkey: (id: string) =>
    invoke<void>('unregister_hotkey', { id }),

  readClipboard: () =>
    invoke<string>('read_clipboard'),

  writeClipboard: (text: string) =>
    invoke<void>('write_clipboard', { text }),
}
