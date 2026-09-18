import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FASE_LABEL, MODALIDADES, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { baixarImagem, desenharResumo, obterMoldura } from "@/lib/shareImage.js";
import { TeamBadge, flagUrl } from "@/components/TeamBadge.jsx";

const FORMATOS = ["9:16", "4:5"];

export function MatchSummaryDialog({ jogo, onClose }) {
  const state = useJesState();
  const A = turmaById(state, jogo.turmaA);
  const B = turmaById(state, jogo.turmaB);
  const m = MODALIDADES.find((x) => x.slug === jogo.modalidadeSlug);
  const [baixando, setBaixando] = useState(null);
  const [baixandoMoldura, setBaixandoMoldura] = useState(null);

  if (!A || !B || !m) return null;

  const quando = new Date(jogo.data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const fase = FASE_LABEL[jogo.fase] ?? jogo.fase;
  const vencedor = jogo.wo
    ? jogo.wo === "A"
      ? A
      : B
    : jogo.placarA === jogo.placarB
      ? undefined
      : jogo.placarA > jogo.placarB
        ? A
        : B;
  const perdedor = vencedor ? (vencedor.id === A.id ? B : A) : undefined;

  const montarDados = () => ({
    modalidade: m.nome,
    fase:
      jogo.fase === "grupos"
        ? `${fase} · Grupo ${jogo.grupo ?? "-"}`
        : fase,
    quando,
    local: jogo.local,
    turmaA: A.nome,
    paisA: A.selecao.pais,
    bandeiraA: flagUrl(A.selecao.code, 640),
    turmaB: B.nome,
    paisB: B.selecao.pais,
    bandeiraB: flagUrl(B.selecao.code, 640),
    placarA: jogo.placarA,
    placarB: jogo.placarB,
    situacao:
      jogo.status === "encerrado"
        ? "Encerrado"
        : jogo.status === "ao-vivo"
          ? "Ao vivo"
          : "Agendado",
    wo: Boolean(jogo.wo),
    nota: jogo.status === "ao-vivo" ? "Jogo em andamento" : undefined,
  });

  const baixar = async (f) => {
    setBaixando(f);
    try {
      const url = await desenharResumo(f, montarDados());
      if (url)
        baixarImagem(
          url,
          `jes2026-${m.slug}-${jogo.id}-${f.replace(":", "x")}.png`,
        );
    } finally {
      setBaixando(null);
    }
  };

  const baixarMoldura = async (f) => {
    setBaixandoMoldura(f);
    try {
      const url = await desenharResumo(f, montarDados(), {
        fundoForcado: obterMoldura(f),
      });
      if (url)
        baixarImagem(
          url,
          `jes2026-moldura-${m.slug}-${jogo.id}-${f.replace(":", "x")}.png`,
        );
    } finally {
      setBaixandoMoldura(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-foreground/40 p-4 overflow-y-auto grid place-items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Resumo do jogo"
      >
        <motion.div
          initial={{ y: 16, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong w-full max-w-lg rounded-3xl p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-accent flex items-center gap-1 mb-1">
                {m.icon && (
                  <img
                    src={m.icon}
                    alt={m.nome}
                    className="w-4 h-4 object-contain"
                  />
                )}
                {m.nome}
              </div>
              <h2 className="font-display text-2xl tracking-wider">
                RESUMO DO JOGO
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-2 rounded-lg hover:bg-foreground/5"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamBadge turma={A} />
            <div className="font-display text-4xl text-center">
              {jogo.status === "agendado" ? (
                <span className="text-xl text-muted-foreground">vs</span>
              ) : (
                `${jogo.placarA} : ${jogo.placarB}`
              )}
            </div>
            <div className="justify-self-end">
              <TeamBadge turma={B} />
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Info
              rotulo="Fase"
              valor={
                jogo.fase === "grupos" ? `Grupo ${jogo.grupo ?? "-"}` : fase
              }
            />
            <Info
              rotulo="Situação"
              valor={
                jogo.status === "ao-vivo"
                  ? "Ao vivo"
                  : jogo.status === "encerrado"
                    ? "Encerrado"
                    : "Agendado"
              }
            />
            <Info rotulo="Data e hora" valor={quando} />
            <Info rotulo="Local" valor={jogo.local} />
            {typeof jogo.setsA === "number" &&
              typeof jogo.setsB === "number" && (
                <Info rotulo="Sets" valor={`${jogo.setsA} x ${jogo.setsB}`} />
              )}

            {jogo.status === "encerrado" && (
              <>
                <Info
                  rotulo="Campeã do jogo"
                  valor={vencedor ? vencedor.nome : "Empate"}
                />
                {perdedor && <Info rotulo="Adversária" valor={perdedor.nome} />}
              </>
            )}
            {jogo.wo && (
              <Info
                rotulo="Observação"
                valor={`W.O. — vitória para ${jogo.wo === "A" ? A.nome : B.nome}`}
              />
            )}
          </dl>

          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Baixar imagem
            </p>
            <div className="flex flex-wrap gap-2">
              {FORMATOS.map((f) => (
                <button
                  key={f}
                  onClick={() => baixar(f)}
                  disabled={baixando !== null}
                  className="inline-flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-xs hover:bg-foreground/5 disabled:opacity-50"
                >
                  <Download className="size-3.5" /> {f}
                </button>
              ))}
            </div>

          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Baixar moldura (somente os dados)
            </p>
            <div className="flex flex-wrap gap-2">
              {FORMATOS.map((f) => (
                <button
                  key={f}
                  onClick={() => baixarMoldura(f)}
                  disabled={baixandoMoldura !== null}
                  className="inline-flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-xs hover:bg-foreground/5 disabled:opacity-50"
                >
                  <Download className="size-3.5" /> {f}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/modalidades/$slug"
            params={{ slug: m.slug }}
            onClick={onClose}
            className="mt-4 inline-block text-xs text-accent"
          >
            Ver tudo de {m.nome} →
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ rotulo, valor }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </dt>
      <dd className="truncate">{valor}</dd>
    </div>
  );
}
