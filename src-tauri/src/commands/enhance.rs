use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EnhanceResponse {
    pub result: String,
    pub tokens_used: u32,
    pub cost_usd: f64,
}

#[tauri::command]
pub async fn enhance_text(
    text: String,
    mode: String,
    provider: String,
) -> Result<EnhanceResponse, AppError> {
    let _ = (text, mode, provider);
    todo!("enhance_text — implement in v0.1 sprint")
}
