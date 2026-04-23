use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub provider: String,
    pub stt_engine: String,
    pub selected_mode: String,
    pub privacy_mode: bool,
    pub hotkey_enhance: String,
    pub hotkey_dictate: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            provider: "openai".to_string(),
            stt_engine: "whisper_api".to_string(),
            selected_mode: "fix_grammar".to_string(),
            privacy_mode: false,
            hotkey_enhance: "CommandOrControl+Shift+E".to_string(),
            hotkey_dictate: "CommandOrControl+Shift+D".to_string(),
        }
    }
}

#[tauri::command]
pub async fn get_settings() -> Result<Settings, AppError> {
    todo!("get_settings — implement in v0.1 sprint")
}

#[tauri::command]
pub async fn set_settings(settings: Settings) -> Result<(), AppError> {
    let _ = settings;
    todo!("set_settings — implement in v0.1 sprint")
}
