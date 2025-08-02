import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import App from "./App.tsx";

// Make React available globally for plugins
(window as any).React = React;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
