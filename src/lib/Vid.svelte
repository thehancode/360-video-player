<script lang="ts">
  import { onDestroy } from "svelte";
  export let path: string;
  const mediaTypes: Record<string, string> = {
    webm: "video/webm",
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    m4v: "video/mp4",
    ogv: "video/ogg",
    mov: "video/quicktime",
  };
  // Video.js selects its playback tech before the HTTP Content-Type arrives.
  $: sourceType = mediaTypes[path.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? ""];
  onDestroy(() => {
    // Release the VR renderer/decoder before the plain-video diagnostic test.
    const playerWindow = window as Window & { player?: { dispose: () => void } };
    playerWindow.player?.dispose();
    delete playerWindow.player;
  });
</script>


<svelte:head>
  <script src="dist-vr/videojs-vr.js"></script>
  <script defer src="vid.js"></script>
</svelte:head>


<div class="video-container">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    id="my-video"
    crossorigin="anonymous"
    class="vid-js video-js vjs-theme-fantasy"
    controls
    disablePictureInPicture
    preload="auto"
  >
    <source src={path} type={sourceType} />
  </video>
</div>

<style>
  .vid-js {
    height: 100vh;
    width: 100vw;
  }
  .video-container {
    height: 100vh;
    width: 100vw;
  }
</style>
