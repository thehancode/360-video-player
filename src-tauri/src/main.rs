// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
mod media;

// Other platforms retain Tauri's asset protocol.
#[cfg(not(target_os = "linux"))]
#[tauri::command]
fn local_video_url(path: String) -> Option<String> {
    let _ = path;
    None
}

fn main() {
    // WebKitGTK's GStreamer GL sink can supply corrupt frames to canvas/WebGL
    // (reproduced with VP9 on WebKitGTK 2.52.6 / AMD / Wayland). Use its fallback
    // video sink while retaining WebGL for VR. Set this before WebKit or worker
    // threads start, and respect an explicit user override (0 restores GL).
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_GST_DISABLE_GL_SINK").is_none() {
        std::env::set_var("WEBKIT_GST_DISABLE_GL_SINK", "1");
    }

    let builder = tauri::Builder::default().plugin(tauri_plugin_dialog::init());
    #[cfg(target_os = "linux")]
    let builder = builder
        .setup(|app| {
            use tauri::Manager;
            app.manage(media::MediaServer::start()?);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![media::local_video_url]);
    #[cfg(not(target_os = "linux"))]
    let builder = builder.invoke_handler(tauri::generate_handler![local_video_url]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
