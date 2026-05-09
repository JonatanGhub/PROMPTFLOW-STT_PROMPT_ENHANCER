/// Tauri commands for managing provider API keys in the OS keychain.
use crate::error::AppError;
use crate::storage::keychain::KeychainStore;
use tauri::AppHandle;

/// Saves the API key for `provider` to the OS keychain.
#[tauri::command]
pub async fn save_api_key(_app: AppHandle, provider: String, key: String) -> Result<(), AppError> {
    KeychainStore::new().set_api_key(&provider, &key)
}

/// Returns `true` if an API key exists for `provider` in the OS keychain.
#[tauri::command]
pub async fn has_api_key(_app: AppHandle, provider: String) -> Result<bool, AppError> {
    KeychainStore::new().has_api_key(&provider)
}

/// Removes the API key for `provider` from the OS keychain.
/// Idempotent: succeeds even when no key was stored.
#[tauri::command]
pub async fn delete_api_key(_app: AppHandle, provider: String) -> Result<(), AppError> {
    KeychainStore::new().delete_api_key(&provider)
}
