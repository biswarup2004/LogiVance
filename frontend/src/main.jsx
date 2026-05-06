import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles/theme.css";
import "./styles/globals.css";

if (typeof globalThis.global === "undefined") {
  globalThis.global = globalThis;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
