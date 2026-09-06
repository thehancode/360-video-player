<script lang="ts">
  import Vid from "./lib/Vid.svelte";
  import Selector from "./lib/SelectorTauri.svelte";
  import Overlay from "./lib/Overlay.svelte";
  import PlaybackDiagnostics from "./lib/PlaybackDiagnostics.svelte";

  let selectedPath: string = "";
  let plain = false;

  function handlePathSelected(event: CustomEvent<string>) {
    console.log(JSON.stringify(event));
    console.log(event);
    console.log(event.detail);

    selectedPath = event.detail;
  }
</script>

<main class="container">
  {#if selectedPath}
    {#if plain}
      <!-- svelte-ignore a11y-media-has-caption -->
      <video class="plain-video" src={selectedPath} controls autoplay crossorigin="anonymous"></video>
    {:else}
      <Vid path={selectedPath} />
      <button class="plain-test" on:click={() => plain = true}>Test plain video</button>
    {/if}
    <Overlay />
    <button class="sample-test" on:click={() => { plain = true; selectedPath = "/a.webm"; }}>Test bundled sample</button>
  {:else}
    <Selector on:pathSelected={handlePathSelected} />
  {/if}
</main>
<PlaybackDiagnostics path={selectedPath} {plain} />

<svelte:head>
  <script src="dist-vid/video.js"></script>
  <link href="dist-vid/video-js.css" rel="stylesheet" />
  <link href="dist-vr/videojs-vr.css" rel="stylesheet" />
  <link rel="stylesheet" href="fantasy.css" />
  <link rel="stylesheet" href="vid.css" />
</svelte:head>

<style>
  .plain-video { width: 100vw; height: 100vh; }
  .plain-test { position: fixed; top: 8px; left: 8px; z-index: 10000; padding: 8px; }
  .sample-test { position: fixed; top: 48px; left: 8px; z-index: 10000; padding: 8px; }
</style>
