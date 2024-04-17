<div align="center">
	<br>
	  <p><a href="https://github.com/thehancode/360-video-player/"><img src="public/logo.svg" width="140" alt="360-video-player" /></a></p>
  <p><b>360-video-player</b></p>
 Play It Your Way in your Cinema Sphere 
</div>

# 360 Video Player 
360 Video Player is a local video player for 360 video. Simply drag your video file into the player to instantly immerse yourself in a 360-degree experience, all from the comfort of your own device. Designed with a focus on local playback, our player lets you explore a full 360-degree world without needing constant internet access. Enjoy seamless, high-quality playback of your favorite panoramic content, anytime, anywhere.



https://github.com/thehancode/360-video-player/assets/55881352/135274ea-7906-4c1c-a857-0e5f4f207be8


## Installation
👋 Welcome to the installation guide for 360-Video-Player! Simply follow the instructions below for your operating system.

### 🖥️ Windows 

1. Head over to our [releases page](https://github.com/thehancode/360-video-player/releases) and download the `360-video-player_<version>.msi` file.
2. Double-click the downloaded file and follow the installation wizard.

## 🐧 Ubuntu, Debian-based OS 
1. Head over to our [releases page](https://github.com/thehancode/360-video-player/releases) and download the `360-video-player_<version>.deb` file.
2. Open a terminal and navigate to the directory containing the downloaded file.
3. Run one of the following commands, replacing <version> with the name of your file. 

`
sudo dpkg -i 360-video-player_<version>.deb
`

or

`
sudo apt install ./360-video-player_<version>.deb
`

## 🛠️ Build from source
If you prefer to build the application from source, follow these steps:
1. Clone the repository and navigate to the project directory.
2. Run the following commands: 

```
npm install
npm run tauri build
```
3. The built files will be available in the `360-video-player\src-tauri\target\release` directory. 
