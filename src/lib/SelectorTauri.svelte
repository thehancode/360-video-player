<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { open } from "@tauri-apps/api/dialog";
  import { convertFileSrc } from "@tauri-apps/api/tauri";

  let container: HTMLDivElement;

  const dispatch = createEventDispatcher();

  async function handleFileSelect() {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Media",
            extensions: ["mp4", "webm" , "mkv"],
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
    container.addEventListener("click", handleFileSelect);

    window.addEventListener("tauri://file-drop", async (event: any) => {
      const file = event.detail.file;
      const fileURL = convertFileSrc(file);
      dispatch("pathSelected", fileURL);
    });

    container.addEventListener("dragover", (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });
</script>

<div>
  <div class="container" bind:this={container}>
    <div class="item-logo">
      <img class="logo" src="/logo.svg" alt="Logo" />
    </div>
    <div class="item-text">
      <div class="item">Click or drop file to play here.</div>
    </div>
  </div>
</div>

<style>
  .container {
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
