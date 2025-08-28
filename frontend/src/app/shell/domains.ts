import { domainRegistry } from "./contracts";

// Register domains here.

import("../../domains/turnarounds/domain").then(({ default: TurnaroundsDomain }) => {
  try {
    domainRegistry.register(TurnaroundsDomain);
  } catch (e) {
    if (import.meta.env.MODE !== "production") {
      // eslint-disable-next-line no-console
      console.warn("Turnarounds domain registration failed:", e);
    }
  }
});

// Register the Home domain by default
import("../../domains/home/domain").then(({ default: HomeDomain }) => {
  try {
    domainRegistry.register(HomeDomain);
  } catch (e) {
    if (import.meta.env.MODE !== "production") {
      // eslint-disable-next-line no-console
      console.warn("Home domain registration failed:", e);
    }
  }
});

