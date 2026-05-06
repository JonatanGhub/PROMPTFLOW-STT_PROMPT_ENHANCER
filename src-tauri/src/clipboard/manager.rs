/// Clipboard read/write — wraps tauri-plugin-clipboard-manager
pub struct ClipboardManager;

impl ClipboardManager {
    pub fn new() -> Self { Self }
}

impl Default for ClipboardManager {
    fn default() -> Self { Self::new() }
}
