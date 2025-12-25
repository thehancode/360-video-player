// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{GlobalShortcutManager, Manager};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let main_window = app.get_window("main")
                .expect("Failed to get main window");
            
            // Register F key shortcut
            let window_f = main_window.clone();
            if let Err(e) = app.global_shortcut_manager()
                .register("F", move || {
                    let is_fullscreen = window_f.is_fullscreen().unwrap_or(false);
                    let _ = window_f.set_fullscreen(!is_fullscreen);
                }) {
                eprintln!("Failed to register F key shortcut: {}", e);
            }
            
            // Register F11 key shortcut
            let window_f11 = main_window.clone();
            if let Err(e) = app.global_shortcut_manager()
                .register("F11", move || {
                    let is_fullscreen = window_f11.is_fullscreen().unwrap_or(false);
                    let _ = window_f11.set_fullscreen(!is_fullscreen);
                }) {
                eprintln!("Failed to register F11 key shortcut: {}", e);
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
