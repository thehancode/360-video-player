//! Linux WebKit/GStreamer needs real HTTP for reliable local media playback.
use axum::{
    body::Body,
    extract::{Request, State},
    http::{header, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    Router,
};
use std::{
    net::TcpListener,
    path::PathBuf,
    sync::{Arc, RwLock},
};
use tauri::Manager;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeFile,
    set_header::SetResponseHeaderLayer,
};
use uuid::Uuid;

#[derive(Clone)]
struct SelectedVideo {
    route: String,
    path: PathBuf,
}

type Selection = Arc<RwLock<Option<SelectedVideo>>>;

pub struct MediaServer {
    port: u16,
    selection: Selection,
}

impl MediaServer {
    pub fn start() -> std::io::Result<Self> {
        // The OS chooses a free port; never expose files to the LAN.
        let listener = TcpListener::bind((std::net::Ipv4Addr::LOCALHOST, 0))?;
        listener.set_nonblocking(true)?;
        let port = listener.local_addr()?.port();
        let selection = Selection::default();
        let app = router(selection.clone());
        tauri::async_runtime::spawn(async move {
            let result = match tokio::net::TcpListener::from_std(listener) {
                Ok(listener) => axum::serve(listener, app).await,
                Err(error) => Err(error),
            };
            if let Err(error) = result {
                eprintln!("Local video server failed: {error}");
            }
        });
        Ok(Self { port, selection })
    }

    fn select(&self, path: PathBuf) -> Result<String, String> {
        // Replacing the selection revokes the previous URL for new requests.
        // Video.js infers the format from the URL before fetching the response.
        // Keep an extension, while leaving the actual filename private.
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .filter(|ext| !ext.is_empty() && ext.bytes().all(|byte| byte.is_ascii_alphanumeric()))
            .map(|ext| format!(".{}", ext.to_ascii_lowercase()))
            .unwrap_or_default();
        let route = format!("/video/{}{extension}", Uuid::new_v4());
        let url = format!("http://127.0.0.1:{}{}", self.port, route);
        *self
            .selection
            .write()
            .map_err(|_| "Video selection lock failed")? = Some(SelectedVideo { route, path });
        Ok(url)
    }
}

#[tauri::command]
pub async fn local_video_url(
    app: tauri::AppHandle,
    server: tauri::State<'_, MediaServer>,
    path: String,
) -> Result<Option<String>, String> {
    // The native picker and drag/drop extend this scope. IPC cannot publish
    // arbitrary files just by knowing their paths.
    if !app.asset_protocol_scope().is_allowed(&path) {
        return Err("Select the video using the file picker or drag and drop first".into());
    }
    let path = tokio::fs::canonicalize(path)
        .await
        .map_err(|e| e.to_string())?;
    let metadata = tokio::fs::metadata(&path)
        .await
        .map_err(|e| e.to_string())?;
    if !metadata.is_file() {
        return Err("The selected path is not a file".into());
    }
    // Check readability before handing a URL to the player.
    tokio::fs::File::open(&path)
        .await
        .map_err(|e| e.to_string())?;
    server.select(path).map(Some)
}

fn router(selection: Selection) -> Router {
    Router::new()
        .fallback(serve_video)
        .with_state(selection)
        // Anonymous CORS is required for the VR renderer to use video textures.
        // Access is controlled by the random per-selection URL, not cookies.
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::HEAD, Method::OPTIONS])
                .allow_headers([header::RANGE])
                .expose_headers([
                    header::CONTENT_RANGE,
                    header::ACCEPT_RANGES,
                    header::CONTENT_LENGTH,
                ]),
        )
        .layer(SetResponseHeaderLayer::overriding(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store"),
        ))
}

async fn serve_video(State(selection): State<Selection>, request: Request) -> Response {
    let selected = match selection.read() {
        Ok(selected) => selected.clone(),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let Some(selected) = selected.filter(|video| request.uri().path() == video.route) else {
        return StatusCode::NOT_FOUND.into_response();
    };
    // ServeFile streams bounded chunks and implements GET/HEAD and byte ranges,
    // including open-ended/suffix ranges and 416 for unsatisfiable requests.
    match ServeFile::new(selected.path).try_call(request).await {
        Ok(response) => response.map(Body::new),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};

    async fn request(port: u16, method: &str, path: &str, extra: &str) -> (String, Vec<u8>) {
        let mut stream = tokio::net::TcpStream::connect(("127.0.0.1", port))
            .await
            .unwrap();
        stream.write_all(format!("{method} {path} HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nOrigin: tauri://localhost\r\nConnection: close\r\n{extra}\r\n").as_bytes()).await.unwrap();
        let mut response = Vec::new();
        stream.read_to_end(&mut response).await.unwrap();
        let split = response.windows(4).position(|w| w == b"\r\n\r\n").unwrap();
        (
            String::from_utf8(response[..split].to_vec())
                .unwrap()
                .to_lowercase(),
            response[split + 4..].to_vec(),
        )
    }

    #[tokio::test]
    async fn http_stream_supports_playback_seeking_and_selection_isolation() {
        let path = std::env::temp_dir().join(format!("video test # {}.webm", Uuid::new_v4()));
        let bytes = b"0123456789abcdef";
        std::fs::write(&path, bytes).unwrap();
        let server = MediaServer::start().unwrap();
        let url = server.select(path.clone()).unwrap();
        assert!(
            url.ends_with(".webm"),
            "Video.js needs a recognizable source extension"
        );
        let route = url
            .strip_prefix(&format!("http://127.0.0.1:{}", server.port))
            .unwrap();

        let (headers, body) = request(server.port, "GET", route, "").await;
        assert!(headers.starts_with("http/1.1 200"));
        assert!(headers.contains("content-type: video/webm"));
        assert!(headers.contains("accept-ranges: bytes"));
        assert!(headers.contains("access-control-allow-origin: *"));
        assert!(headers.contains("cache-control: no-store"));
        assert_eq!(body, bytes);

        for (range, expected, content_range) in [
            ("bytes=2-5", &bytes[2..6], "bytes 2-5/16"),
            ("bytes=10-", &bytes[10..], "bytes 10-15/16"),
            ("bytes=-4", &bytes[12..], "bytes 12-15/16"),
        ] {
            let (headers, body) =
                request(server.port, "GET", route, &format!("Range: {range}\r\n")).await;
            assert!(headers.starts_with("http/1.1 206"));
            assert!(headers.contains(&format!("content-range: {content_range}")));
            assert_eq!(body, expected);
        }
        let (headers, body) = request(server.port, "HEAD", route, "").await;
        assert!(headers.starts_with("http/1.1 200"));
        assert!(headers.contains("content-length: 16"));
        assert!(body.is_empty());
        let (headers, _) = request(server.port, "GET", route, "Range: bytes=99-\r\n").await;
        assert!(headers.starts_with("http/1.1 416"));
        assert!(headers.contains("content-range: bytes */16"));
        let (headers, _) = request(server.port, "POST", route, "Content-Length: 0\r\n").await;
        assert!(headers.starts_with("http/1.1 405"));
        for invalid in [
            "/",
            "/video/wrong-token",
            "/etc/passwd",
            "/video/../etc/passwd",
        ] {
            let (headers, _) = request(server.port, "GET", invalid, "").await;
            assert!(headers.starts_with("http/1.1 404"));
        }
        server.select(path.clone()).unwrap();
        let (headers, _) = request(server.port, "GET", route, "").await;
        assert!(headers.starts_with("http/1.1 404"));
        std::fs::remove_file(path).unwrap();
    }
}
