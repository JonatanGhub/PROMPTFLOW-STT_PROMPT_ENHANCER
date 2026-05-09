use crate::error::AppError;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub async fn read_clipboard(app: tauri::AppHandle) -> Result<String, AppError> {
    let text = app
        .clipboard()
        .read_text()
        .map_err(|e| AppError::Clipboard(e.to_string()))?;

    if text.trim().is_empty() {
        return Err(AppError::Clipboard("Clipboard is empty".to_string()));
    }

    Ok(text)
}

#[tauri::command]
pub async fn write_clipboard(app: tauri::AppHandle, text: String) -> Result<(), AppError> {
    app.clipboard()
        .write_text(tauri_plugin_clipboard_manager::ClipboardContents::PlainText(
            text,
        ))
        .map_err(|e| AppError::Clipboard(e.to_string()))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::error::AppError;

    /// Verify that AppError::Clipboard is the correct variant used for clipboard errors,
    /// and that its message is surfaced correctly via Display.
    #[test]
    fn clipboard_error_message_is_preserved() {
        let msg = "Clipboard is empty";
        let err = AppError::Clipboard(msg.to_string());

        // The thiserror Display impl wraps it as "Clipboard error: {0}"
        assert!(
            err.to_string().contains(msg),
            "AppError::Clipboard should expose its inner message"
        );
    }

    /// Verify that an empty-string detection logic matches our trim() check.
    #[test]
    fn empty_trim_detection() {
        let whitespace_only = "   \t\n  ";
        assert!(
            whitespace_only.trim().is_empty(),
            "Whitespace-only clipboard content should be treated as empty"
        );

        let non_empty = "  hello  ";
        assert!(
            !non_empty.trim().is_empty(),
            "Non-empty content should not be flagged as empty"
        );
    }
}
