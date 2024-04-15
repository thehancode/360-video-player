<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  let container: HTMLDivElement;
  let fileInput: HTMLInputElement;

  const dispatch = createEventDispatcher();

  function handleFileSelect(file: File | undefined) {
    if (!file) {
      console.warn("No file selected");
      return;
    }

    const fileURL = URL.createObjectURL(file);
    dispatch("pathSelected", fileURL);
  }

  onMount(() => {
    container.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      handleFileSelect(file);
    });

    container.addEventListener("dragover", (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    });

    container.addEventListener("drop", (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer?.files[0];
      handleFileSelect(file);
    });
  });
</script>

<div>
  <div class="container" bind:this={container}>
    <div class="item-logo">
      <img class="logo" src="/logo.svg" />
    </div>
    <div class="item-text">
      <div>Drop file to play here.</div>
    </div>
    <input type="file" bind:this={fileInput} style="display: none;" />
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

  .logo {
    width: 100%;
    height: 30vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
