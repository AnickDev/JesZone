import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GlassCard } from "@/components/GlassCard.jsx";
import { TeamBadge } from "@/components/TeamBadge.jsx";
import { MatchSummaryDialog } from "@/components/MatchSummaryDialog.jsx";
import { FASE_LABEL, MODALIDADES, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { temFavorito, isFavorito, toggleFavorito } from "@/lib/favoritos.js";
import { MapPin, Star } from "lucide-react";

// Janela de tempo (ms) entre o 1º clique (só "arma" a confirmação) e o 2º
// clique consecutivo na mesma equipe (que de fato alterna o favorito).
const JANELA_CONFIRMACAO_MS = 600;

export function MatchCard({ j, mostrarModalidade = true, onFavoritar }) {
  const state = useJesState();
  const A = turmaById(state, j.turmaA);
  const B = turmaById(state, j.turmaB);
  const [destaque, setDestaque] = useState(false);
  const [favA, setFavA] = useState(false);
  const [favB, setFavB] = useState(false);
  const [armado, setArmado] = useState(null);
  const armadoTimer = useRef(null);
  const [resumo, setResumo] = useState(false);

  useEffect(() => {
    const sync = () => {
      setDestaque(temFavorito(j));
      setFavA(isFavorito(j.turmaA));
      setFavB(isFavorito(j.turmaB));
    };
    sync();
    window.addEventListener("jes-favoritos", sync);
    return () => window.removeEventListener("jes-favoritos", sync);
  }, [j]);

  useEffect(() => () => clearTimeout(armadoTimer.current), []);

  // Favoritar por clique direto na área da equipe: o 1º clique apenas "arma"
  // a confirmação (não altera o favorito); o 2º clique consecutivo na mesma
  // equipe, dentro da janela de tempo, confirma o toggle do favorito.
  // Reaproveita o mecanismo de persistência já existente (lib/favoritos.js).
  function clicarEquipe(e, turmaId) {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(armadoTimer.current);

    if (armado === turmaId) {
      setArmado(null);
      const vaiFavoritar = !isFavorito(turmaId);
      toggleFavorito(turmaId);
      if (vaiFavoritar) onFavoritar?.(turmaId);
      return;
    }

    setArmado(turmaId);
    armadoTimer.current = setTimeout(
      () => setArmado(null),
      JANELA_CONFIRMACAO_MS,
    );
  }

  if (!A || !B) return null;
  const m = MODALIDADES.find((x) => x.slug === j.modalidadeSlug);
  const quando = new Date(j.data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const conteudo = (
    <GlassCard
      className={`p-3 hover:scale-[1.01] transition ${destaque ? "ring-1 ring-accent/70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
        <span className="text-accent truncate">
          {mostrarModalidade && m ? ` ${m.nome} · ` : ""}
          {j.fase === "grupos" ? `Grupo ${j.grupo ?? "-"}` : FASE_LABEL[j.fase]}
        </span>
        {j.status === "ao-vivo" ? (
          <span className="text-destructive animate-pulse shrink-0">
            ● AO VIVO
          </span>
        ) : (
          <span className="text-muted-foreground shrink-0">
            {j.status === "encerrado" ? "Encerrado" : quando}
          </span>
        )}
      </div>
      <div className="match-teams mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-1">
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={(e) => clicarEquipe(e, A.id)}
            aria-pressed={favA}
            aria-label={`${favA ? "Remover" : "Favoritar"} ${A.nome}${armado === A.id ? " — toque novamente para confirmar" : ""}`}
            className={`flex w-full items-center justify-between gap-1 min-w-0 rounded-lg px-1.5 py-1 text-left transition border-l-[4px] border-y-0 border-r-0 ${favA ? "border-l-accent" : "border-l-transparent"} ${armado === A.id ? "bg-accent/10" : "hover:bg-foreground/5"}`}
          >
            <TeamBadge turma={A} wrap />
            <Star
              aria-hidden
              className={`size-3.5 shrink-0 ${favA ? "text-accent fill-accent" : "text-muted-foreground/40"}`}
            />
          </button>
          <AnimatePresence>
            {armado === A.id && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-8 left-0 z-20 whitespace-nowrap rounded-lg bg-foreground text-background text-[10px] font-semibold px-2 py-1 shadow-lg pointer-events-none"
              >
                Toque duas vezes p/ favoritar ⭐
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="font-display text-xl sm:text-3xl text-center whitespace-nowrap px-1 self-center">
          {j.status === "agendado" ? (
            <span className="text-muted-foreground text-sm sm:text-xl">vs</span>
          ) : (
            `${j.placarA} : ${j.placarB}`
          )}
        </div>
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={(e) => clicarEquipe(e, B.id)}
            aria-pressed={favB}
            aria-label={`${favB ? "Remover" : "Favoritar"} ${B.nome}${armado === B.id ? " — toque novamente para confirmar" : ""}`}
            className={`flex w-full items-center justify-between gap-1 min-w-0 rounded-lg px-1.5 py-1 text-right transition border-r-[4px] border-y-0 border-l-0 ${favB ? "border-r-accent" : "border-r-transparent"} ${armado === B.id ? "bg-accent/10" : "hover:bg-foreground/5"}`}
          >
            <Star
              aria-hidden
              className={`size-3.5 shrink-0 ${favB ? "text-accent fill-accent" : "text-muted-foreground/40"}`}
            />
            <TeamBadge turma={B} wrap />
          </button>
          <AnimatePresence>
            {armado === B.id && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-8 right-0 z-20 whitespace-nowrap rounded-lg bg-foreground text-background text-[10px] font-semibold px-2 py-1 shadow-lg pointer-events-none"
              >
                Toque duas vezes p/ favoritar ⭐
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{j.status === "encerrado" ? quando : ""}</span>
        <span className="inline-flex items-center gap-1 leading-none inline-block align-middle">
          <MapPin className="size-4 text-accent shrink-0" />
          <span className="leading-none">{j.local}</span>
        </span>
      </div>
      {j.wo && (
        <div className="mt-2 text-xs text-destructive flex items-center justify-center text-center gap-1">
          W.O. — vitória para {j.wo === "A" ? A.nome : B.nome}
        </div>
      )}
    </GlassCard>
  );

  // Somente jogos ENCERRADOS abrem o card de resumo compartilhável.
  if (j.status === "encerrado") {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setResumo(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setResumo(true);
            }
          }}
          className="block w-full text-left cursor-pointer"
          aria-label="Abrir resumo do jogo"
        >
          {conteudo}
        </div>
        {resumo && (
          <MatchSummaryDialog jogo={j} onClose={() => setResumo(false)} />
        )}
      </>
    );
  }

  if (!m) return conteudo;
  return (
    <Link to="/modalidades/$slug" params={{ slug: m.slug }} className="block">
      {conteudo}
    </Link>
  );
}
