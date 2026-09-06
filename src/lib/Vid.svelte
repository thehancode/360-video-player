<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let path: string;

  function getMimeType(url: string) {
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "webm":
        return "video/webm";
      case "mp4":
      case "m4v":
        return "video/mp4";
      case "ogv":
      case "ogg":
        return "video/ogg";
      case "mov":
        return "video/quicktime";
      case "mkv":
        return "video/x-matroska";
      default:
        return undefined;
    }
  }

  $: mimeType = getMimeType(path);

  onMount(async () => {
    while (typeof (window as any).videojs !== "function") {
      await new Promise((r) => setTimeout(r, 10));
    }
    const videojs = (window as any).videojs;

    if (window.player && typeof window.player.dispose === "function") {
      try {
        window.player.dispose();
      } catch (e) {
        console.warn("Error disposing existing player:", e);
      }
    }

    const player = (window.player = videojs("my-video", {
      controls: true,
      autoplay: true,
      controlBar: {
        pictureInPictureToggle: false,
        fullscreenToggle: false,
        remainingTimeDisplay: {
          displayNegative: false,
        },
      },
    }));

    player.mediainfo = player.mediainfo || {};
    player.mediainfo.projection = "360";

    while (!player.vr) {
      await new Promise((r) => setTimeout(r, 10));
    }

    window.vr = player.vr({ projection: "AUTO", debug: false, forceCardboard: false });
  });

  onDestroy(() => {
    if (typeof window !== "undefined" && window.player) {
      try {
        window.player.dispose();
      } catch (e) {
        console.warn("Error disposing player:", e);
      }
      window.player = null;
      window.vr = null;
    }
  });
</script>

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
    {#if mimeType}
      <source src={path} type={mimeType} />
    {:else}
      <source src={path} />
    {/if}
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
