import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Games from "./Games";
import '../../index.css'

const container = document.getElementById("game");

if (!container) {
  throw new Error("Root element #game not found");
}

createRoot(container).render(
  <StrictMode>
    <Games />
  </StrictMode>
);
