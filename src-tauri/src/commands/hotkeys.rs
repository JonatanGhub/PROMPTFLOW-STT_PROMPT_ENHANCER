use crate::error::AppError;

#[tauri::command]
pub async fn register_hotkey(id: String, shortcut: String) -> Result<(), AppError> {
    let _ = (id, shortcut);
    todo!("register_hotkey — implement in v0.1 sprint")
}

#[tauri::command]
pub async fn unregister_hotkey(id: String) -> Result<(), AppError> {
    let _ = id;
    todo!("unregister_hotkey — implement in v0.1 sprint")
}
