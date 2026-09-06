<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc, invoke } from "@tauri-apps/api/core";
  import { getCurrentWebview } from "@tauri-apps/api/webview";

  const dispatch = createEventDispatcher();
  let loading = false;
  let errorMessage = "";

  async function loadFile(path: string) {
    if (loading) return;
    loading = true;
    errorMessage = "";
    try {
      const url = await invoke<string | null>("local_video_url", { path });
      dispatch("pathSelected", url ?? convertFileSrc(path));
    } catch (error) {
      errorMessage = `Could not open video: ${String(error)}`;
      console.error(errorMessage);
    } finally {
      loading = false;
    }
  }

  async function handleFileSelect() {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Media",
            extensions: ["mp4", "webm", "mkv"],
          },
        ],
      });

      if (Array.isArray(selected)) {
        console.warn("Multiple files selected");
        return;
      } else if (selected === null) {
        console.warn("No file selected");
        return;
      }

      await loadFile(selected);
    } catch (error) {
      console.error("Error selecting file:", error);
      errorMessage = `Could not select video: ${String(error)}`;
    }
  }

  onMount(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;
    getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "drop" && event.payload.paths[0]) {
        void loadFile(event.payload.paths[0]);
      }
    }).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    }).catch((error) => console.error("Error listening for dropped files:", error));
    return () => {
      disposed = true;
      unlisten?.();
    };
  });
</script>

<div>
  <button type="button" class="container" on:click={handleFileSelect} disabled={loading}>
    <div class="item-logo">
      <img class="logo" src="/logo.svg" alt="Logo" />
    </div>
    <div class="item-text">
      <div class="item">{loading ? "Opening video…" : "Click or drop file to play here."}</div>
    </div>
  </button>
  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
  {/if}
</div>

<style>
  .error { position: fixed; bottom: 1rem; left: 1rem; right: 1rem; color: #fff; background: #7a2222; padding: 1rem; }
  .container {
    border: 0;
    padding: 0;
    font: inherit;
    cursor: pointer;
    margin: 0;
    display: flex;
    height: 100vh;
    width: 100vw;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background-color: #3b3b3b;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .container:hover {
    background-color: #292929;
  }

  .item-logo {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-align: center;
    width: 100%;
    height: 50vh;
    flex-grow: 0;
    pointer-events: none;
  }

  .item-text {
    display: flex;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 50vh;
    flex-grow: 0;
    font-size: 7vh;
    color: antiquewhite;
  }
  .item {
    margin-top: 10vh;
  }

  .logo {
    width: 100%;
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
