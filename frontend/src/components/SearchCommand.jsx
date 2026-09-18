import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Star, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { buscar } from "@/lib/busca.js";
import { useCategoria } from "@/context/categoria.jsx";
import { useJesState } from "@/context/jesContext.jsx";
import { isFavorito, toggleFavorito } from "@/lib/favoritos.js";

export function SearchCommand({ open, onOpenChange }) {
  const [termo, setTermo] = useState("");
  const [favTick, setFavTick] = useState(0);
  const { categoria } = useCategoria();
  const state = useJesState();
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    const onFav = () => setFavTick((t) => t + 1);
    window.addEventListener("keydown", onKey);
    window.addEventListener("jes-favoritos", onFav);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("jes-favoritos", onFav);
    };
  }, [onOpenChange]);

  const resultados = useMemo(
    () => (open ? buscar(state, termo, categoria) : []),
    [open, termo, categoria, state],
  );
  void favTick;

  const fechar = () => {
    onOpenChange(false);
    setTermo("");
  };

  return (
    <>
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Buscar turma"
        aria-expanded={open}
        className="p-2.5 rounded-lg hover:bg-foreground/5 transition"
      >
        <Search className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/40 p-3 pt-20 flex justify-center"
            onClick={fechar}
          >
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel-solid w-full max-w-xl rounded-2xl p-3 h-fit max-h-[75vh] overflow-y-auto"
              role="dialog"
              aria-label="Buscar"
            >
              <div className="flex items-center gap-2">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Buscar turma, seleção ou página…"
                  maxLength={60}
                  className="flex-1 bg-transparent outline-none text-base sm:text-sm py-2 placeholder:text-muted-foreground"
                />
                <button
                  onClick={fechar}
                  aria-label="Fechar"
                  className="p-2 rounded hover:bg-foreground/5"
                >
                  <X className="size-4" />
                </button>
              </div>

              {termo.trim().length < 2 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Digite ao menos 2 letras. Ex.: “7b”, “setimo b”, “Brasil”, “telão”.
                </p>
              )}

              {termo.trim().length >= 2 && resultados.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Nenhum resultado encontrado.
                </p>
              )}

              <ul className="mt-2 space-y-1">
                {resultados.map((r) => (
                  <li key={r.id} className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        fechar();
                        if (r.turmaId) {
                          nav({ to: "/turmas/$id", params: { id: r.turmaId } });
                        } else if (r.to) {
                          nav({ to: r.to });
                        }
                      }}
                      className="flex-1 text-left rounded-xl px-3 py-3 hover:bg-foreground/5 transition min-w-0"
                    >
                      <span className="block text-sm truncate">
                        {r.tipo === "pagina" ? "→ " : ""}
                        {r.titulo}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {r.subtitulo}
                      </span>
                    </button>
                    {r.turmaId && (
                      <button
                        onClick={() => toggleFavorito(r.turmaId)}
                        aria-label="Favoritar turma"
                        className="p-2.5 rounded-lg hover:bg-foreground/5 shrink-0"
                      >
                        <Star
                          className={`size-4 ${isFavorito(r.turmaId) ? "text-accent fill-accent" : "text-muted-foreground"}`}
                        />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
