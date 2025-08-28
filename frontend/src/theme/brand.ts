// Centralized app branding.
// Reads from Vite env (VITE_APP_NAME, VITE_APP_TAGLINE) with safe fallbacks.
const env = (import.meta as any).env || {};
const DEFAULT_NAME = "RST Projects Portal";
const DEFAULT_TAGLINE = "";

export const APP_NAME: string = env.VITE_APP_NAME || DEFAULT_NAME;
export const APP_TAGLINE: string = env.VITE_APP_TAGLINE || DEFAULT_TAGLINE;
