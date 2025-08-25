/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_SAMPLE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
