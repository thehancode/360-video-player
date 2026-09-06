



# 360 Video Player 
https://github.com/thehancode/360-video-player/assets/55881352/c1430680-230f-49fe-bd93-e759d362d24f

360 Video Player is a local video player for 360 video. Simply drag your video file into the player to instantly immerse yourself in a 360-degree experience, all from the comfort of your own device. Designed with a focus on local playback, our player lets you explore a full 360-degree world without needing constant internet access. Enjoy seamless, high-quality playback of your favorite panoramic content, anytime, anywhere.

<div align="center">
	  <p><a href="https://github.com/thehancode/360-video-player/"><img src="public/logo.svg" width="140" alt="360-video-player" /></a></p>
	<p><a href="https://github.com/thehancode/360-video-player/releases"><img src="https://github.com/thehancode/360-video-player/assets/55881352/86003dd0-80ce-4ce9-a03b-f624ab197a35" height="35" alt="download" /></a></p>
</div>

## Installation
👋 Welcome to the installation guide for 360-Video-Player! Simply follow the instructions below for your operating system.

### 🖥️ Windows 




1. Head over to our [releases page](https://github.com/thehancode/360-video-player/releases) and download the `360-video-player_<version>.msi` file.
2. Double-click the downloaded file and follow the installation wizard.


## 🛠️ Build from source
This desktop app uses Tauri 2. Install Node.js 22+, npm, and stable Rust/Cargo first.

On Ubuntu 24.04/26.04, install the Linux build libraries and video codecs:

```bash
sudo apt update
sudo apt install build-essential pkg-config curl wget file \
  libwebkit2gtk-4.1-dev libssl-dev libxdo-dev \
  libayatana-appindicator3-dev librsvg2-dev patchelf \
  gstreamer1.0-libav gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly
```

From the project directory:

```bash
npm ci
npm run check
npm run tauri dev
```

Use `tauri dev` to test native file selection and drag-and-drop; `npm run dev`
alone only serves the frontend in a browser.

To build a Linux Debian package:

```bash
npm run tauri build -- --bundles deb
```

The installer is written to `src-tauri/target/release/bundle/deb/`.
Video format support depends on the system's GStreamer codecs and WebKitGTK;
test playback, seeking, and 360-degree mouse navigation with your own media.

On Linux, picked and dropped videos stream through a built-in HTTP server on
`127.0.0.1` at an automatically assigned port. This works around WebKit/GStreamer
failures loading local videos through Tauri's `asset://` protocol. No separate
server or internet connection is needed. The server exposes only the selected
file through a random URL, checks Tauri's picker/drop file scope, and supports
byte ranges for seeking without loading the entire video into memory. Selecting
another file invalidates the old URL; the server exits with the app. Windows and
macOS continue to use Tauri's asset protocol.

Linux startup also defaults `WEBKIT_GST_DISABLE_GL_SINK=1`. On the tested AMD /
Wayland system with WebKitGTK 2.52.6, the GStreamer GL video sink produced corrupt
pixels when decoded video frames were used by canvas and WebGL. WebKit's fallback
video sink fixed the frame-to-texture test while leaving WebGL available for the
360-degree renderer. This may increase CPU usage. The app respects an existing
value; to compare the accelerated video sink on other drivers or newer WebKit:

```bash
WEBKIT_GST_DISABLE_GL_SINK=0 npm run tauri dev
```

Fully restart the app when changing this setting. This workaround does not
require transcoding files or changing the desktop session from Wayland to X11.

To verify the Linux workaround, run `npm run tauri dev`, open a video with the
picker, check playback and seeking near the end, then return to the selector
and repeat with drag and drop. Check 360-degree mouse navigation as well; the
existing **Test plain video** button can isolate decoding from VR rendering.
The diagnostics should show an `http://127.0.0.1:…/video/…` source for local files.

Build on the oldest Linux distribution you intend to support, since binaries
built on Ubuntu 26.04 may require newer system libraries than older releases.

For other platforms and bundle formats, install the
[Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) and run
`npm run tauri build`. Packages are written to `src-tauri/target/release/bundle/`.
