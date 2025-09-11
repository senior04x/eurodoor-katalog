import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css";

// React StrictMode qo‘shamiz → dev/prod bir xil bo‘ladi
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
