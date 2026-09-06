<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ pathSelected: string }>();
  let loading = false;
  let errorMessage = "";
  let fileInput: HTMLInputElement;

  async function selectVideo() {
    if (loading) return;
    loading = true;
    errorMessage = "";
    try {
      if (window.videoPlayer?.chooseVideo) {
        const url = await window.videoPlayer.chooseVideo();
        if (url) dispatch("pathSelected", url);
      } else {
        fileInput?.click();
      }
    } catch (error) {
      errorMessage = `Could not open video: ${String(error)}`;
      console.error(errorMessage);
    } finally {
      loading = false;
    }
  }

  function handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      dispatch("pathSelected", fileURL);
    }
  }

  async function dropVideo(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file || loading) return;
    loading = true;
    errorMessage = "";
    try {
      if (window.videoPlayer?.registerDroppedVideo) {
        const url = await window.videoPlayer.registerDroppedVideo(file);
        if (url) {
          dispatch("pathSelected", url);
          return;
        }
      }
      const fileURL = URL.createObjectURL(file);
      dispatch("pathSelected", fileURL);
    } catch (error) {
      errorMessage = `Could not open video: ${String(error)}`;
      console.error(errorMessage);
    } finally {
      loading = false;
    }
  }
</script>

<div>
  <button type="button" class="container" on:click={selectVideo} on:dragover|preventDefault on:drop={dropVideo} disabled={loading}>
    <div class="item-logo"><img class="logo" src="/logo.svg" alt="Logo" /></div>
    <div class="item-text"><div class="item">{loading ? "Opening video…" : "Click or drop file to play here."}</div></div>
  </button>
  <input type="file" bind:this={fileInput} on:change={handleFileInputChange} accept="video/*" style="display: none;" />
  {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
</div>

<style>
  .error { position: fixed; bottom: 1rem; left: 1rem; right: 1rem; color: #fff; background: #7a2222; padding: 1rem; }
  .container { border: 0; padding: 0; font: inherit; cursor: pointer; margin: 0; display: flex; height: 100vh; width: 100vw; flex-direction: column; justify-content: center; text-align: center; background-color: #3b3b3b; user-select: none; }
  .container:hover { background-color: #292929; }
  .item-logo { display: flex; flex-direction: column; justify-content: flex-end; text-align: center; width: 100%; height: 50vh; flex-grow: 0; pointer-events: none; }
  .item-text { display: flex; justify-content: center; text-align: center; width: 100%; height: 50vh; flex-grow: 0; font-size: 7vh; color: antiquewhite; }
  .item { margin-top: 10vh; }
  .logo { width: 100%; height: 30vh; display: flex; justify-content: center; align-items: center; }
</style>
