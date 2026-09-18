import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { catLabel, MODALIDADES } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { MatchCard } from "@/components/MatchCard.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import { useCategoria } from "@/context/categoria.jsx";
import { priorizarFavoritos } from "@/lib/favoritos.js";
import apito from '../assets/apito.png'

export const Route = createFileRoute("/historico")({
  component: HistoricoView,
});

function HistoricoView() {
  const { categoria } = useCategoria();
  const [slug, setSlug] = useState("todas");
  const state = useJesState();

  const lista = useMemo(
    () =>
      priorizarFavoritos(
        state.jogos
          .filter(
            (j) =>
              j.categoria === categoria &&
              j.status === "encerrado" &&
              (slug === "todas" || j.modalidadeSlug === slug),
          )
          .sort((a, b) => +new Date(b.data) - +new Date(a.data)),
      ),
    [state.jogos, categoria, slug],
  );

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 pt-6">
      <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 flex items-center gap-3">
        <History className="size-8 text-accent" /> HISTÓRICO
      </h1>

      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        aria-label="Filtrar por modalidade"
        className="mb-3 bg-card border border-border rounded-lg px-3 py-2 text-sm"
      >
        <option value="todas" className="text-black">
          Todas as modalidades
        </option>
        {MODALIDADES.filter((m) => m.formato === "confrontos").map((m) => (
          <option key={m.slug} value={m.slug} className="text-black">
            {m.nome}
          </option>
        ))}
      </select>

      {lista.length === 0 ? (
        <EmptyState
          icon={
            <img
              src={apito}
              alt="Apito"
              className="imagem-apito"
              style={{ width: "76px", height: "76px", objectFit: "contain", margin: "0 auto" }}
            />
          }
          titulo="Nenhum jogo encerrado"
          descricao="Os resultados das partidas disputadas aparecerão aqui."
        />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {lista.map((j) => (
            <MatchCard key={j.id} j={j} />
          ))}
        </div>
      )}
    </div>
  );
}
