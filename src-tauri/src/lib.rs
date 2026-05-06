mod audio;
mod clipboard;
mod commands;
mod cost;
mod enhancement;
mod error;
mod hotkeys;
mod permissions;
mod providers;
mod stt;
mod storage;
mod telemetry;
mod updater;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::enhance::enhance_text,
            commands::stt::start_recording,
            commands::stt::stop_recording,
            commands::stt::check_stt_status,
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::hotkeys::register_hotkey,
            commands::hotkeys::unregister_hotkey,
            commands::clipboard::read_clipboard,
            commands::clipboard::write_clipboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
