



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
Build on the oldest Linux distribution you intend to support, since binaries
built on Ubuntu 26.04 may require newer system libraries than older releases.

For other platforms and bundle formats, install the
[Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) and run
`npm run tauri build`. Packages are written to `src-tauri/target/release/bundle/`.
