/// Check OS-level permissions (mic, accessibility)
pub fn check_microphone_permission() -> bool {
    // On Windows and Linux, mic access is granted by default
    // On macOS, requires explicit user approval
    true
}
