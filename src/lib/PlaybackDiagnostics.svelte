<script lang="ts">
  import { onMount } from "svelte";
  export let path = "";
  export let plain = false;
  let lines: string[] = [];
  let probeController: AbortController | undefined;

  async function probeSource(url: string) {
    probeController?.abort();
    const controller = new AbortController();
    probeController = controller;
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(url, {
        headers: { Range: "bytes=0-15" }, signal: controller.signal,
      });
      log(`source probe ${url}: status=${response.status} type=${response.headers.get("content-type")} length=${response.headers.get("content-length")} range=${response.headers.get("content-range")}`);
      const reader = response.body?.getReader();
      if (reader) {
        try {
          const { value } = await reader.read();
          log(`source first bytes=${Array.from(value?.slice(0, 16) || [], (byte) => byte.toString(16).padStart(2, "0")).join(" ")}`);
        } finally {
          await reader.cancel();
        }
      }
    } catch (error) {
      log(`source probe failed ${url}: ${String(error)}`);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  $: if (path) void probeSource(path);

  function log(message: string) {
    lines = [...lines.slice(-99), `${new Date().toISOString()} ${message}`];
  }

  $: if (path) log(`source=${path} mode=${plain ? "plain" : "VR"}`);

  onMount(() => {
    log(`userAgent=${navigator.userAgent}`);
    const probe = document.createElement("video");
    log(`VP9 support=${probe.canPlayType('video/webm; codecs="vp9"') || "unsupported"}`);
    const state = (video: HTMLVideoElement) => JSON.stringify({
      src: video.currentSrc || video.src,
      readyState: video.readyState,
      networkState: video.networkState,
      time: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      size: `${video.videoWidth}x${video.videoHeight}`,
      buffered: Array.from({ length: video.buffered.length }, (_, i) =>
        [video.buffered.start(i), video.buffered.end(i)]),
      error: video.error && { code: video.error.code, message: video.error.message },
    });
    const mediaEvent = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) {
        log(`${event.type} ${state(event.target)}`);
      }
    };
    const events = ["loadstart", "loadedmetadata", "loadeddata", "canplay", "playing",
      "waiting", "stalled", "suspend", "abort", "emptied", "error", "pause", "ended"];
    events.forEach((name) => document.addEventListener(name, mediaEvent, true));
    const error = (event: ErrorEvent) => log(`JS error: ${event.message} ${event.filename}:${event.lineno}`);
    const rejection = (event: PromiseRejectionEvent) => log(`Promise rejection: ${String(event.reason)}`);
    const csp = (event: SecurityPolicyViolationEvent) => log(`CSP blocked: ${event.violatedDirective} ${event.blockedURI}`);
    const playerEvent = (event: Event) => log(String((event as CustomEvent).detail));
    window.addEventListener("player-diagnostic", playerEvent);
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", rejection);
    document.addEventListener("securitypolicyviolation", csp);
    const timer = window.setInterval(() => {
      document.querySelectorAll("video").forEach((video) => log(`snapshot ${state(video)}`));
    }, 5000);
    return () => {
      probeController?.abort();
      events.forEach((name) => document.removeEventListener(name, mediaEvent, true));
      window.removeEventListener("error", error);
      window.removeEventListener("player-diagnostic", playerEvent);
      window.removeEventListener("unhandledrejection", rejection);
      document.removeEventListener("securitypolicyviolation", csp);
      window.clearInterval(timer);
    };
  });
</script>

<details>
  <summary>Playback diagnostics</summary>
  <p>After reproducing the issue, select and copy this log. It includes the selected file path.</p>
  <textarea aria-label="Playback diagnostic log" readonly value={lines.join("\n")}></textarea>
</details>

<style>
  details { position: fixed; bottom: 48px; left: 8px; z-index: 10000; max-width: calc(100vw - 16px); background: #181818; color: white; padding: 8px; font: 13px sans-serif; }
  summary { cursor: pointer; }
  textarea { width: min(800px, 85vw); height: 220px; background: #111; color: #eee; font: 12px monospace; }
</style>
