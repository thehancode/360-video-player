<script lang="ts">
    import { onMount } from "svelte";

    let barContainer: HTMLDivElement;
    let timeoutId: number;

    function hideBarContainer() {
        barContainer.classList.add("fade");
    }

    function showBarContainer() {
        barContainer.classList.remove("fade");
    }
    function resetTimeout() {
        clearTimeout(timeoutId);
        showBarContainer();
        timeoutId = setTimeout(hideBarContainer, 1000);
    }
    onMount(() => {
        timeoutId = setTimeout(hideBarContainer, 1000);
    });
</script>

<div bind:this={barContainer} class="bar-container">
    <a href="index.html"> x </a>
</div>

<style>
    .bar-container {
        display: flex;
        justify-content: flex-end;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
        opacity: 0;

        transition: opacity 0.5s ease;
    }

    .bar-container:hover {
        opacity: 1;
    }

    .bar-container a {
        text-decoration: none;
        height: 1.3em;
        width: 1.3em;
        font-size: 2em;
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        background-color: rgba(97, 189, 218, 0.315);
        padding: 5px;
        border-radius: 5px;
        text-align: center;
    }
</style>
