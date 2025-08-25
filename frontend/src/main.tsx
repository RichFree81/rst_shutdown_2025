import "./index.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/taviraj/latin-400.css";
import mont700 from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff2";
import mont600 from "@fontsource/montserrat/files/montserrat-latin-600-normal.woff2";
import tav400 from "@fontsource/taviraj/files/taviraj-latin-400-normal.woff2";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Preload critical fonts for faster first render
for (const href of [mont700, mont600, tav400]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  link.href = href;
  document.head.appendChild(link);
}

const el = document.getElementById("root")!;
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
