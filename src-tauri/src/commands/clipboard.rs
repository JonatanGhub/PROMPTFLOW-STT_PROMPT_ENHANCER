use crate::error::AppError;

#[tauri::command]
pub async fn read_clipboard() -> Result<String, AppError> {
    todo!("read_clipboard — implement in v0.1 sprint")
}

#[tauri::command]
pub async fn write_clipboard(text: String) -> Result<(), AppError> {
    let _ = text;
    todo!("write_clipboard — implement in v0.1 sprint")
}
