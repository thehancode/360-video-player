<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { getCurrentWebview } from "@tauri-apps/api/webview";

  const dispatch = createEventDispatcher();

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

      const fileURL = convertFileSrc(selected);
      dispatch("pathSelected", fileURL);
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  }

  onMount(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;
    getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "drop" && event.payload.paths[0]) {
        dispatch("pathSelected", convertFileSrc(event.payload.paths[0]));
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
  <button type="button" class="container" on:click={handleFileSelect}>
    <div class="item-logo">
      <img class="logo" src="/logo.svg" alt="Logo" />
    </div>
    <div class="item-text">
      <div class="item">Click or drop file to play here.</div>
    </div>
  </button>
</div>

<style>
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
