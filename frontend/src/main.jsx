import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router.jsx";
import "./styles/global.css";

const router = getRouter();

const raiz = document.getElementById("root");

createRoot(raiz).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
