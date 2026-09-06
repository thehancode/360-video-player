<script lang="ts">
  import Vid from "./lib/Vid.svelte";
  import Selector from "./lib/SelectorTauri.svelte";
  import Overlay from "./lib/Overlay.svelte";

  let selectedPath: string = "";

  function handlePathSelected(event: CustomEvent<string>) {
    console.log(JSON.stringify(event));
    console.log(event);
    console.log(event.detail);

    selectedPath = event.detail;
  }
</script>

<main class="container">
  {#if selectedPath}
    <Vid path={selectedPath} />
    <Overlay />
  {:else}
    <Selector on:pathSelected={handlePathSelected} />
  {/if}
</main>

<svelte:head>
  <script src="dist-vid/video.js"></script>
  <link href="dist-vid/video-js.css" rel="stylesheet" />
  <link href="dist-vr/videojs-vr.css" rel="stylesheet" />
  <link rel="stylesheet" href="fantasy.css" />
  <link rel="stylesheet" href="vid.css" />
</svelte:head>

<style>
</style>
