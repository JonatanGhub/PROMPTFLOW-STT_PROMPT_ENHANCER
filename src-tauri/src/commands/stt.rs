use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct STTStatus {
    pub available: bool,
    pub reason: Option<String>,
}

#[tauri::command]
pub async fn start_recording(engine: String) -> Result<(), AppError> {
    let _ = engine;
    todo!("start_recording — implement in v0.2 sprint")
}

#[tauri::command]
pub async fn stop_recording() -> Result<String, AppError> {
    todo!("stop_recording — implement in v0.2 sprint")
}

#[tauri::command]
pub async fn check_stt_status(engine: String) -> Result<STTStatus, AppError> {
    let _ = engine;
    Ok(STTStatus {
        available: false,
        reason: Some("Not yet implemented".to_string()),
    })
}
