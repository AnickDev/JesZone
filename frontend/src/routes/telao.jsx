import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Clock, Maximize, Minimize, MonitorPlay, ChevronDown } from "lucide-react";
import { CATEGORIAS, catLabelCurto, FASE_LABEL, MODALIDADES, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { flagUrl } from "@/components/TeamBadge.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import semSinal from '../assets/semSinal.png'

export const Route = createFileRoute("/telao")({
  component: Telao,
});

const CICLO_MS = 3_000;
// Seletor nativo do Telão: appearance-none + seta própria (ChevronDown), com
// espaçamento (pr-9) para a seta não ficar colada à borda da caixa.
const SELECT_TELAO =
  "w-full appearance-none rounded-lg pl-3 pr-9 py-2.5 text-xs font-semibold bg-card text-foreground border border-border min-h-11";

/** Caixa de seleção do Telão com seta afastada da borda e feedback de clique (leve deslocamento para cima). */
function SeletorTelao({ value, onChange, ariaLabel, children }) {
  return (
    <div className="relative inline-block group">
      <select value={value} onChange={onChange} aria-label={ariaLabel} className={SELECT_TELAO}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-transform duration-150 ease-out group-active:translate-y-[calc(-50%-3px)]"
      />
    </div>
  );
}

function Telao() {
  const state = useJesState();
  const [categoria, setCategoria] = useState("todas");
  const [modalidade, setModalidade] = useState("todas");
  const [tipo, setTipo] = useState("combinados");
  const [indice, setIndice] = useState(0);
  const [cheia, setCheia] = useState(false);
  const palco = useRef(null);

  const jogos = useMemo(() => {
    const relevantes = state.jogos
      .filter((j) => categoria === "todas" || j.categoria === categoria)
      .filter((j) => modalidade === "todas" || j.modalidadeSlug === modalidade);
    if (tipo === "ao-vivo") return relevantes.filter((j) => j.status === "ao-vivo");
    if (tipo === "agendado")
      return relevantes
        .filter((j) => j.status === "agendado")
        .sort((a, b) => +new Date(a.data) - +new Date(b.data))
        .slice(0, 12);
    if (tipo === "encerrado")
      return relevantes
        .filter((j) => j.status === "encerrado")
        .sort((a, b) => +new Date(b.data) - +new Date(a.data))
        .slice(0, 12);
    const vivos = relevantes.filter((j) => j.status === "ao-vivo");
    const agendados = relevantes
      .filter((j) => j.status === "agendado")
      .sort((a, b) => +new Date(a.data) - +new Date(b.data))
      .slice(0, 12);
    const encerrados = relevantes
      .filter((j) => j.status === "encerrado")
      .sort((a, b) => +new Date(b.data) - +new Date(a.data))
      .slice(0, 12);
    return [...vivos, ...agendados, ...encerrados];
  }, [state.jogos, categoria, modalidade, tipo]);

  useEffect(() => {
    setIndice(0);
  }, [categoria, modalidade, tipo]);

  useEffect(() => {
    if (jogos.length <= 1) return;
    const iv = setInterval(() => setIndice((i) => (i + 1) % jogos.length), CICLO_MS);
    return () => clearInterval(iv);
  }, [jogos.length]);

  useEffect(() => {
    const sync = () => setCheia(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const alternarCheia = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await palco.current?.requestFullscreen();

      const orientation = screen.orientation;
      await orientation?.lock?.("landscape").catch(() => undefined);
    } catch {
      /* navegador pode bloquear */
    }
  };

  const atual = jogos[Math.min(indice, Math.max(0, jogos.length - 1))];

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 pt-6">

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 flex items-center gap-3">
          <MonitorPlay className="size-8 text-[#f3bb1f]" />
          TELÃO
        </h1>
        <div className="flex flex-wrap gap-2">
          <SeletorTelao value={categoria} onChange={(e) => setCategoria(e.target.value)} ariaLabel="Categoria">
            <option value="todas">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {catLabelCurto(c)}
              </option>
            ))}
          </SeletorTelao>
          <SeletorTelao value={modalidade} onChange={(e) => setModalidade(e.target.value)} ariaLabel="Modalidade">
            <option value="todas">Todas as modalidades</option>
            {MODALIDADES.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </SeletorTelao>
          <SeletorTelao value={tipo} onChange={(e) => setTipo(e.target.value)} ariaLabel="Partidas">
            <option value="combinados">Combinados</option>
            <option value="ao-vivo">Ao vivo</option>
            <option value="agendado">Agendados</option>
            <option value="encerrado">Encerrados</option>
          </SeletorTelao>
          <button
            onClick={alternarCheia}
            aria-label={cheia ? "Sair da tela cheia" : "Ativar tela cheia"}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 min-h-11 text-xs font-semibold border border-border hover:bg-foreground/5"
          >
            {cheia ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            {cheia ? "Sair" : "Tela cheia"}
          </button>
        </div>
      </div>

      {!atual ? (
        <EmptyState
          icon = {semSinal}
          titulo="Sem jogos para exibir"
          descricao="O telão mostra partidas ao vivo e os resultados mais recentes."
        />
      ) : (
        <>
          <div
            ref={palco}
            className={`telao-fullscreen ${cheia
              ? "w-screen h-screen overflow-hidden rounded-none"
              : "w-full overflow-visible"
              }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={atual.id}
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -16 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full"
              >
                <SlideJogo jogo={atual} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {jogos.map((j, i) => (
              <button
                key={j.id}
                onClick={() => setIndice(i)}
                aria-label={`Ir para jogo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === indice ? "w-8 bg-accent" : "w-3 bg-border"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
            Rotação automática a cada {CICLO_MS / 1000} segundos · {jogos.length} jogo(s)
          </p>
        </>
      )}
    </div>
  );
}

function SlideJogo({ jogo }) {
  const state = useJesState();
  const A = turmaById(state, jogo.turmaA);
  const B = turmaById(state, jogo.turmaB);
  if (!A || !B) return null;
  const m = MODALIDADES.find((x) => x.slug === jogo.modalidadeSlug);

  return (
    <div className="panel-solid telao-card rounded-3xl p-5 sm:p-10 text-center relative overflow-hidden">


      <div className="flex flex-col items-center justify-center gap-1 text-[10px] sm:text-sm uppercase tracking-[0.2em]">
        {jogo.status === "ao-vivo" ? (
          <span className="text-base sm:text-2xl font-extrabold text-destructive animate-pulse">● AO VIVO</span>
        ) : (
          <span className="text-base sm:text-2xl font-extrabold text-muted-foreground">
            {jogo.status === "agendado" ? "Agendado" : "Encerrado"}
          </span>
        )}
        <span className="text-lg sm:text-3xl font-extrabold text-accent">
          {m?.nome}
        </span>
        <span className="text-base sm:text-xl font-bold text-muted-foreground">
          {jogo.fase === "grupos" ? `Grupo ${jogo.grupo ?? "-"}` : FASE_LABEL[jogo.fase]}
        </span>

      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
        {[A, B].map((t, idx) => (
          <div
            key={t.id}
            className={`min-w-0 ${idx === 1 ? "order-3" : ""} flex flex-col items-center gap-2`}
          >
            <img
              src={flagUrl(t.selecao.code, 320)}
              alt={t.selecao.pais}
              width={160}
              height={106}
              className="w-20 sm:w-40 rounded ring-1 ring-border"
            />
            <p className="font-display text-xl sm:text-3xl tracking-wider truncate max-w-full">
              {t.nome}
            </p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              {t.selecao.pais}
            </p>
          </div>
        ))}
        <div className="order-2 font-display text-5xl sm:text-8xl leading-none">
          {jogo.status === "agendado" ? (
            <span className="text-muted-foreground">VS</span>
          ) : (
            <>
              {jogo.placarA}
              <span className="text-accent mx-2">:</span>
              {jogo.placarB}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 text-base sm:text-xl font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <MapPin className="size-5 sm:size-6 text-accent" />
          {jogo.local}
        </span>

        <span className="inline-flex items-center gap-2">
          <Clock className="size-5 sm:size-6 text-accent" />
          {new Date(jogo.data).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }).replace(":", "h")}
        </span>
      </div>
      {jogo.wo && (
        <p className="mt-1 text-xs text-destructive">
          W.O. — vitória para {jogo.wo === "A" ? A.nome : B.nome}
        </p>
      )}
    </div>
  );
}
