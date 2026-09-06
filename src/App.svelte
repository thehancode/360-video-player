<script lang="ts">
  import { onMount } from "svelte";
  import Vid from "./lib/Vid.svelte";
  import Selector from "./lib/SelectorElectron.svelte";
  import Overlay from "./lib/Overlay.svelte";

  let selectedPath: string = "";

  function handlePathSelected(event: CustomEvent<string>) {
    selectedPath = event.detail;
  }

  function handleClose() {
    selectedPath = "";
  }

  onMount(async () => {
    try {
      const initial = await window.videoPlayer?.getInitialVideo?.();
      if (initial) {
        selectedPath = initial;
      }
    } catch (e) {
      console.warn("Could not load initial video argument:", e);
    }
  });
</script>

<main class="container">
  {#if selectedPath}
    <Vid path={selectedPath} />
    <Overlay on:close={handleClose} />
  {:else}
    <Selector on:pathSelected={handlePathSelected} />
  {/if}
</main>
