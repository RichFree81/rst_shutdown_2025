import { domainRegistry } from "./contracts";

// Conditionally register domains here. Sample domain is gated by env flag.
// Default: DISABLED unless explicitly enabled.
const SAMPLE_ENABLED = String(import.meta.env.VITE_ENABLE_SAMPLE_DOMAIN || "").toLowerCase() === "true";

if (SAMPLE_ENABLED) {
  import("../../domains/sample/domain").then(({ default: SampleDomain }) => {
    try {
      domainRegistry.register(SampleDomain);
    } catch (e) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.warn("Sample domain registration failed:", e);
      }
    }
  });
}
