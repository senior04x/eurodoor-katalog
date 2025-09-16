import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/liquid-kapsula.css";
import { attachAuthListener } from "./auth/listener";

// initialize listeners
attachAuthListener()

// React StrictMode qo'shamiz → dev/prod bir xil bo'ladi
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
