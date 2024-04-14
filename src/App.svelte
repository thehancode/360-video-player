<script lang="ts">
  import Vid from "./lib/Vid.svelte";
  import Selector from "./lib/Selector.svelte";

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
  {:else}
    <Selector on:pathSelected={handlePathSelected} />
  {/if}
</main>

<style>
</style>
