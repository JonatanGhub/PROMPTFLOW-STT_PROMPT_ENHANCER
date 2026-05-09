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
        // updater: stub for future sprints — plugin requires config; skip for v0.1
        .setup(|app| {
            use tauri::Emitter;
            use tauri_plugin_clipboard_manager::ClipboardExt;
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

            let shortcut = "CommandOrControl+Shift+E"
                .parse::<tauri_plugin_global_shortcut::Shortcut>()
                .expect("default hotkey is always valid");

            app.handle().global_shortcut().on_shortcut(
                shortcut,
                |app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let text = app.clipboard().read_text().unwrap_or_default();
                        let _ = app.emit("hotkey://enhance", text);
                    }
                },
            )?;

            Ok(())
        })
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
            commands::api_key::save_api_key,
            commands::api_key::has_api_key,
            commands::api_key::delete_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
