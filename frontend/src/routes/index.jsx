import { useJesState } from "@/context/jesContext.jsx";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { GlassCard } from "@/components/GlassCard.jsx";
import {
  catLabel,
  MODALIDADES,
  liderGeral,
  turmaById,
} from "@/lib/jesConfig.js";
import { Radio, Trophy, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { TeamBadge } from "@/components/TeamBadge.jsx";
import { useCategoria } from "@/context/categoria.jsx";
import { flagUrl } from "@/components/TeamBadge.jsx";
import LogoJogos from "@/components/LogoJogos.jsx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const { categoria } = useCategoria();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("jes-data-changed", h);
    return () => window.removeEventListener("jes-data-changed", h);
  }, []);
  void tick;

  const state = useJesState();
  const base = state.jogos.filter((j) => j.categoria === categoria);
  const aoVivo = base.filter((j) => j.status === "ao-vivo").slice(0, 4);
  const lider = liderGeral(state, categoria).slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="flex flex-col justify-start items-center px-4 pt-12 sm:pt-4 pb-6 relative">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="text-center max-w-3xl w-full"
        >
          <div className="flex justify-center items-center w-full pt-4 sm:pt-2">
            <LogoJogos />
          </div>

          <div className="mt-10 sm:mt-0 flex flex-wrap justify-center gap-3">
            <Link to="/ao-vivo" className="bg-black text-white px-5 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:scale-105 transition">
              <Radio className="size-[18px] text-[#D71920]" /> Ver Jogos Ao Vivo
            </Link>
            <Link to="/modalidades" className="border border-gray-400 px-5 py-3 rounded-lg font-semibold text-sm hover:bg-foreground/5">
              Modalidades
            </Link>
          </div>
        </motion.div>

        <motion.div className="pt-2 text-xs text-muted-foreground text-center" animate={{ y: [24, 32, 24] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          ↓ role para explorar
        </motion.div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:pt-6 grid gap-4 md:grid-cols-2">        <GlassCard>
        <div className="flex items-center gap-2 text-accent">
          <Radio className="size-4 animate-pulse text-[#D71920]" />
          <h2 className="font-display text-xl tracking-wider text-black">
            AO VIVO
          </h2>
        </div>
        <div className="mt-3 space-y-2">
          {aoVivo.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum jogo agora.
            </p>
          )}
          {aoVivo.map((j) => {
            const A = turmaById(state, j.turmaA);
            const B = turmaById(state, j.turmaB);
            const m = MODALIDADES.find((x) => x.slug === j.modalidadeSlug);
            if (!A || !B || !m) return null;
            return (
              <div key={j.id} className="rounded-lg bg-muted p-2">
                <div className="text-[10px] uppercase tracking-wider text-[#D71920]">{m.nome}</div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={flagUrl(A.selecao.code, 40)}
                      alt={A.selecao.pais}
                      width={18}
                      height={12}
                      className="rounded-[1px] ring-1 ring-border shrink-0"
                    />
                    <span className="text-xs truncate">{A.nome}</span>
                  </span>
                  <span className="font-display text-lg shrink-0">
                    {j.placarA} : {j.placarB}
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0 justify-end">
                    <span className="text-xs truncate text-right">{B.nome}</span>
                    <img
                      src={flagUrl(B.selecao.code, 40)}
                      alt={B.selecao.pais}
                      width={18}
                      height={12}
                      className="rounded-[1px] ring-1 ring-border shrink-0"
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <Link
          to="/ao-vivo"
          className="mt-3 inline-flex items-center gap-1 text-xs text-black"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-[#f3bb1f]" />
            <h2 className="font-display text-xl tracking-wider text-black">
              LÍDER GERAL
            </h2>
          </div>
          <div className="mt-3 space-y-2">
            {lider.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ranking em construção.
              </p>
            )}
            {lider.map((r, i) => {
              const t = turmaById(state, r.turmaId);
              if (!t) return null;
              return (
                <div
                  key={r.turmaId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-display text-lg w-5 text-[#f3bb1f]">
                      {i + 1}º
                    </span>
                    <TeamBadge turma={t} size={28} />
                  </div>
                  <span className="font-display text-lg">
                    {r.pontos}
                    <span className="text-xs text-muted-foreground ml-1">
                      pts
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            to="/lider-geral"
            className="mt-3 inline-flex items-center gap-1 text-xs text-black"
          >
            Pódio completo <ArrowRight className="size-3" />
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}
