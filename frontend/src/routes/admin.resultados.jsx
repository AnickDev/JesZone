import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CATEGORIAS, catLabelCurto, FASE_LABEL, MODALIDADES, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import * as api from "@/services/api.js";
import { AdminSection, btnCls, btnGhost, Feedback, selectCls, useAdminAction } from "@/lib/admin.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import semSinal from '../assets/semSinal.png'

export const Route = createFileRoute("/admin/resultados")({
  component: AdminResultados,
});

const STATUS = ["agendado", "ao-vivo", "encerrado"];
const STATUS_LABEL = {
  agendado: "Agendado",
  "ao-vivo": "Ao vivo",
  encerrado: "Encerrado",
};

function AdminResultados() {
  const state = useJesState();
  const [categoria, setCategoria] = useState("Medio");
  const [slug, setSlug] = useState("todas");
  const [status, setStatus] = useState("todos");
  const { run, salvando, erro, ok } = useAdminAction();

  const jogos = useMemo(
    () =>
      state.jogos
        .filter((j) => j.categoria === categoria)
        .filter((j) => slug === "todas" || j.modalidadeSlug === slug)
        .filter((j) => status === "todos" || j.status === status)
        .sort((a, b) => +new Date(a.data) - +new Date(b.data)),
    [state.jogos, categoria, slug, status],
  );

  const porFase = useMemo(() => {
    const map = new Map();
    for (const j of jogos) {
      const k = j.fase === "grupos" ? `Grupo ${j.grupo ?? "-"}` : FASE_LABEL[j.fase];
      map.set(k, [...(map.get(k) ?? []), j]);
    }
    return [...map.entries()];
  }, [jogos]);

  return (
    <div className="space-y-3">
      <AdminSection titulo="Filtros">
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={selectCls}
            aria-label="Categoria"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {catLabelCurto(c)}
              </option>
            ))}
          </select>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={selectCls}
            aria-label="Modalidade"
          >
            <option value="todas">Todas as modalidades</option>
            {MODALIDADES.filter((m) => m.formato === "confrontos").map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectCls}
            aria-label="Status"
          >
            <option value="todos">Todos os status</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2">
          <Feedback erro={erro} ok={ok} />
        </div>
      </AdminSection>

      {jogos.length === 0 ? (
        <EmptyState
          icon={semSinal}
          titulo="Nenhum jogo neste filtro"
          descricao="Gere a tabela em Jogos & Tabela para começar."
        />
      ) : (
        porFase.map(([fase, lista]) => (
          <AdminSection key={fase} titulo={fase}>
            <div className="space-y-2">
              {lista.map((j) => (
                <LinhaJogo
                  key={j.id}
                  jogo={j}
                  salvando={salvando}
                  onPatch={(patch) => run(() => api.atualizarJogo(j.id, patch, true))}
                />
              ))}
            </div>
          </AdminSection>
        ))
      )}
    </div>
  );
}

function LinhaJogo({ jogo, salvando, onPatch }) {
  const state = useJesState();
  const A = turmaById(state, jogo.turmaA);
  const B = turmaById(state, jogo.turmaB);
  const [a, setA] = useState(jogo.placarA);
  const [b, setB] = useState(jogo.placarB);

  // Mantém os contadores sincronizados com o placar real do jogo (por
  // exemplo, após um W.O. definir o placar automaticamente no backend).
  useEffect(() => {
    setA(jogo.placarA);
    setB(jogo.placarB);
  }, [jogo.placarA, jogo.placarB]);

  if (!A || !B) return null;

  // Jogo encerrado por W.O.: placar e status ficam travados no painel até o
  // W.O. ser removido (evita alteração manual e inconsistências entre
  // status, placar e pontuação da fase de grupos).
  const travadoPorWO = Boolean(jogo.wo);
  const sujo = !travadoPorWO && (a !== jogo.placarA || b !== jogo.placarB);

  return (
    <div className="rounded-xl border border-border bg-muted p-2.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="truncate">
          {MODALIDADES.find((m) => m.slug === jogo.modalidadeSlug)?.nome} ·{" "}
          {new Date(jogo.data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>📍 {jogo.local}</span>
      </div>

      {travadoPorWO && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Placar travado por W.O. Remova o W.O. abaixo para editar manualmente.
        </p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Contador nome={A.nome} valor={a} onChange={setA} disabled={travadoPorWO} />
        <Contador nome={B.nome} valor={b} onChange={setB} disabled={travadoPorWO} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {STATUS.map((s) => (
          <button
            key={s}
            disabled={salvando || travadoPorWO}
            onClick={() => onPatch({ status: s, placarA: a, placarB: b })}
            className={`px-3 min-h-11 rounded-lg text-xs disabled:opacity-50 ${jogo.status === s
              ? "bg-accent text-accent-foreground font-semibold"
              : "border border-border hover:bg-foreground/5"
              }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}

        <button
          disabled={salvando || !sujo || travadoPorWO}
          onClick={() => onPatch({ placarA: a, placarB: b })}
          className={`text-xs px-3 ml-auto min-h-11 rounded-lg font-semibold transition ${sujo
            ? "bg-accent text-black hover:brightness-95"
            : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          Salvar placar
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
        <span className="text-muted-foreground mr-1">W.O.:</span>
        <button
          disabled={salvando}
          onClick={() => onPatch({ wo: "A", status: "encerrado", placarA: 1, placarB: 0 })}
          className={`text-xs px-3 py-1.5 rounded-full border max-w-[45%] truncate transition ${jogo.wo === "A"
              ? "bg-black text-white border-black font-semibold"
              : "border-border text-muted-foreground hover:border-black hover:text-black"
            }`}
        >
          {A.nome}
        </button>
        <button
          disabled={salvando}
          onClick={() => onPatch({ wo: "B", status: "encerrado", placarA: 0, placarB: 1 })}
          className={`text-xs px-3 py-1.5 rounded-full border max-w-[45%] truncate transition ${jogo.wo === "B"
              ? "bg-black text-white border-black font-semibold"
              : "border-border text-muted-foreground hover:border-black hover:text-black"
            }`}
        >
          {B.nome}
        </button>
        {jogo.wo && (
          <button
            disabled={salvando}
            onClick={() => onPatch({ wo: null })}
            className="text-xs px-3 py-1.5 rounded-full text-destructive hover:underline"
          >
            Remover W.O.
          </button>
        )}
      </div>
    </div>
  );
}

function Contador({ nome, valor, onChange, disabled = false }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <p className="text-xs font-semibold truncate">{nome}</p>
      <div className="mt-1 flex items-center gap-1">
        <button
          disabled={disabled}
          onClick={() => onChange(Math.max(0, valor - 1))}
          aria-label={`Diminuir ponto de ${nome}`}
          className="size-12 grid place-items-center rounded-lg border border-border hover:bg-foreground/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Minus className="size-4" />
        </button>
        <span className="flex-1 text-center font-display text-3xl">{valor}</span>
        <button
          disabled={disabled}
          onClick={() => onChange(Math.min(999, valor + 1))}
          aria-label={`Aumentar ponto de ${nome}`}
          className="size-12 grid place-items-center rounded-lg bg-jes-green text-white active:scale-95 hover:brightness-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
