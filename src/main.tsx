// =============================================================================
// src/main.tsx
// Application entry point. Mounts <App /> and loads the design-system styles.
// =============================================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import "./ui/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in index.html");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
