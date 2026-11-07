import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("linklab.theme") === "dark",
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
