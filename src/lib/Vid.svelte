<script lang="ts">
  export let path: string;
</script>

<svelte:head>
  <script src="dist/video.js"></script>
  <script src="dist-vr/videojs-vr.js"></script>
  <script src="vid.js"></script>
  <link href="dist/video-js.css" rel="stylesheet" />
  <link href="dist-vr/videojs-vr.css" rel="stylesheet" />
  <link rel="stylesheet" href="vid.css" />
  <link rel="stylesheet" href="fantasy.css" />
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
    <source src={path} type="video/mp4" />
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
