<script lang="ts">
  export let path: string;
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
