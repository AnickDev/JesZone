import { useJesState } from "@/context/jesContext.jsx";
import { createFileRoute } from "@tanstack/react-router";
import { catLabel, MODALIDADES } from "@/lib/jesConfig.js";
import { MatchCard } from "@/components/MatchCard.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import { IconeModalidade } from "@/components/IconeModalidade.jsx";
import { Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useCategoria } from "@/context/categoria.jsx";
import { priorizarFavoritos } from "@/lib/favoritos.js";
import radioOff from "../assets/radioOff.svg"

export const Route = createFileRoute("/ao-vivo")({
  component: AoVivoView,
});

function AoVivoView() {
  const { categoria } = useCategoria();
  const [slug, setSlug] = useState("todas");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("jes-data-changed", h);
    window.addEventListener("jes-favoritos", h);
    const iv = setInterval(h, 30_000);
    return () => {
      window.removeEventListener("jes-data-changed", h);
      window.removeEventListener("jes-favoritos", h);
      clearInterval(iv);
    };
  }, []);
  void tick;

  const state = useJesState();
  const vivos = state.jogos.filter((j) => j.categoria === categoria && j.status === "ao-vivo");

  // Agrupado por modalidade: cada modalidade da categoria com seus jogos em andamento.
  const modalidades = MODALIDADES.map((m) => ({
    modalidade: m,
    jogos: priorizarFavoritos(vivos.filter((j) => j.modalidadeSlug === m.slug)),
  }))
    .filter((g) => g.jogos.length > 0)
    .filter((g) => slug === "todas" || g.modalidade.slug === slug);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 flex items-center gap-3">
          <Radio className="size-7 text-destructive animate-pulse" /> AO VIVO
        </h1>
        <div className="glass px-3 py-1 rounded-full text-[11px] uppercase tracking-widest">
          {vivos.length} jogo(s)
        </div>
      </div>

      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        aria-label="Filtrar por modalidade"
        className="mb-6 bg-card border border-border rounded-lg px-3 py-2 text-sm"
      >
        <option value="todas" className="text-black">
          Todas as modalidades
        </option>
        {MODALIDADES.map((m) => (
          <option key={m.slug} value={m.slug} className="text-black">
            {m.nome}
          </option>
        ))}
      </select>

      {modalidades.length === 0 ? (
        <EmptyState
        icon={
       <img 
        src={radioOff} 
        alt="Televisão" 
        className="imagem-centralizada" 
        style={{ 
          width: "64px", 
          height: "64px", 
          objectFit: "contain", 
          margin: "0 auto", 
          filter: "invert(20%) sepia(90%) saturate(6000%) hue-rotate(355deg) brightness(95%) contrast(110%)"}} 
       />
       }
          titulo="Nenhum jogo ao vivo agora"
          descricao="Quando uma partida começar, ela aparece aqui automaticamente."
        />
      ) : (
        <div className="space-y-6">
          {modalidades.map(({ modalidade, jogos }) => (
            <section key={modalidade.slug}>
              <h2 className="font-display text-xl tracking-wider mb-2 flex items-center gap-2">
                <IconeModalidade icon={modalidade.icon} className="size-6" />
                {modalidade.nome}
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {jogos.length} jogo(s)
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {jogos.map((j) => (
                  <MatchCard key={j.id} j={j} mostrarModalidade={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}