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

  function handleWheel(event: WheelEvent) {
    if (!window.vr?.camera || !window.vr?.controls3d?.orbit) return;

    event.preventDefault();

    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    if (event.deltaMode === 1) {
      // Lines
      deltaX *= 20;
      deltaY *= 20;
    } else if (event.deltaMode === 2) {
      // Pages
      deltaX *= 200;
      deltaY *= 200;
    }

    // 1. Vertical scroll (deltaY): Zoom In (scroll up) / Zoom Out (scroll down)
    // Normal 3D FOV range: 30 deg (close up) to 110 deg (wide angle)
    if (Math.abs(deltaY) > 0.01) {
      const camera = window.vr.camera;
      const zoomSensitivity = 0.035;
      const targetFov = camera.fov + deltaY * zoomSensitivity;
      camera.fov = Math.max(30, Math.min(110, targetFov));
      camera.updateProjectionMatrix();
    }

    // 2. Horizontal scroll (deltaX): Move camera left / right
    if (Math.abs(deltaX) > 0.01) {
      const orbit = window.vr.controls3d.orbit;
      const rotateSensitivity = 0.0015;
      orbit.rotateLeft(deltaX * rotateSensitivity);
      orbit.update();
    }
  }

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

    window.addEventListener("wheel", handleWheel, { passive: false });
  });

  onDestroy(() => {
    window.removeEventListener("wheel", handleWheel);
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
