/// <reference types="svelte" />
/// <reference types="vite/client" />

interface Window {
  videoPlayer?: {
    chooseVideo: () => Promise<string | null>;
    registerDroppedVideo: (file: File) => Promise<string | null>;
    getInitialVideo?: () => Promise<string | null>;
  };
  player?: any;
  vr?: any;
}
