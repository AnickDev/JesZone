import { createContext, useContext, useEffect, useState } from "react";
import { categoriaDaPreferencia, EVENTO_PREFERENCIAS } from "@/lib/preferencias.js";

const CategoriaCtx = createContext({ categoria: "Medio", setCategoria: () => {} });
const KEY = "jes-cat-v3";

export function CategoriaProvider({ children }) {
  const [categoria, setCat] = useState("Medio");

  useEffect(() => {
    const sync = () => {
      try {
        const v = localStorage.getItem(KEY);
        if (v === "Fundamental" || v === "Medio") {
          setCat(v);
          return;
        }
      } catch {
        // ignora
      }
      const pref = categoriaDaPreferencia();
      if (pref) setCat(pref);
    };
    sync();
    window.addEventListener(EVENTO_PREFERENCIAS, sync);
    return () => window.removeEventListener(EVENTO_PREFERENCIAS, sync);
  }, []);

  const setCategoria = (c) => {
    setCat(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      // ignora
    }
  };

  return (
    <CategoriaCtx.Provider value={{ categoria, setCategoria }}>{children}</CategoriaCtx.Provider>
  );
}

export function useCategoria() {
  return useContext(CategoriaCtx);
}
