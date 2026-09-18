import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, X } from "lucide-react";
import { EventMap } from "@/components/EventMap.jsx";
import { MatchCard } from "@/components/MatchCard.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import { useJesState } from "@/context/jesContext.jsx";
import { useCategoria } from "@/context/categoria.jsx";
import { catLabel } from "@/lib/jesConfig.js";
import { priorizarFavoritos } from "@/lib/favoritos.js";

export const Route = createFileRoute("/mapa")({
  component: MapaView,
});

function MapaView() {
  const { categoria } = useCategoria();
  const state = useJesState();
  const [local, setLocal] = useState(undefined);

  const ordenar = (lista) =>
    priorizarFavoritos(
      [...lista].sort((a, b) => {
        const peso = (s) => (s === "ao-vivo" ? 0 : s === "agendado" ? 1 : 2);
        return peso(a.status) - peso(b.status) || +new Date(a.data) - +new Date(b.data);
      }),
    );

  const base = state.jogos.filter((j) => j.categoria === categoria && j.status !== "encerrado");

  const doLocal = local
    ? ordenar(base.filter((j) => j.local.toLowerCase() === local.nome.toLowerCase()))
    : [];

  useEffect(() => {
    if (!local) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLocal(undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [local]);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 pt-6">
      <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 flex items-center gap-3">
        <MapPin className="size-8 text-accent" /> MAPA DO EVENTO
      </h1>

      <EventMap selecionado={local?.id} onSelecionar={setLocal} />

      <AnimatePresence>
        {local && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLocal(undefined)}
            role="dialog"
            aria-modal="true"
            aria-label={`Jogos em ${local.nome}`}
            className="fixed inset-0 z-[70] bg-foreground/40 p-3 overflow-y-auto grid place-items-center"
          >
            <motion.div
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel-solid w-full max-w-lg rounded-3xl p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-2xl tracking-wider truncate text-foreground flex items-center justify-center gap-2">
                    <MapPin className="size-8 text-accent shrink-0" />
                    <span className="leading-normal">{local.nome.toUpperCase()}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setLocal(undefined)}
                  aria-label="Fechar"
                  className="size-11 grid place-items-center rounded-xl border border-border hover:bg-foreground/5 shrink-0"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-3 grid gap-2.5 max-h-[60vh] overflow-y-auto">
                {doLocal.length === 0 ? (
                  <EmptyState
                    titulo="Nenhum jogo aqui"
                    descricao="Sem partidas em andamento ou agendadas neste local."
                  />
                ) : (
                  doLocal.map((j) => <MatchCard key={j.id} j={j} />)
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
