import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import {
  CATEGORIAS,
  catLabelCurto,
  MODALIDADES,
  turmaById,
} from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { ICONE_NOTIFICACAO, notificacoesQueryOptions } from "@/lib/jesDados.js";
import * as api from "@/services/api.js";
import {
  AdminSection,
  btnCls,
  Feedback,
  useAdminAction,
} from "@/lib/admin.jsx";

export const Route = createFileRoute("/admin/")({
  component: AdminResumo,
});

function AdminResumo() {
  const state = useJesState();
  const { data: historico } = useQuery(notificacoesQueryOptions());
  const aoVivo = state.jogos.filter((j) => j.status === "ao-vivo");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {CATEGORIAS.map((c) => {
          const jogos = state.jogos.filter((j) => j.categoria === c);
          return (
            <div key={c} className="glass rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {catLabelCurto(c)}
              </p>
              <p className="font-display text-3xl">{jogos.length}</p>
              <p className="text-xs text-muted-foreground">
                {jogos.filter((j) => j.status === "encerrado").length}{" "}
                encerrados ·{" "}
                {state.turmas.filter((t) => t.categoria === c).length} turmas
              </p>
            </div>
          );
        })}
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Ao vivo
          </p>
          <p className="font-display text-3xl text-destructive">
            {aoVivo.length}
          </p>
          <p className="text-xs text-muted-foreground">partidas em andamento</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Pódios
          </p>
          <p className="font-display text-3xl">
            {state.resultadosUnicos.length}
          </p>
          <p className="text-xs text-muted-foreground">
            resultados únicos publicados
          </p>
        </div>
      </div>

      <AdminSection titulo="Atalhos">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {[
            { to: "/admin/resultados", label: "Lançar placares" },
            { to: "/admin/jogos", label: "Gerar tabela" },
            { to: "/admin/unicos", label: "Pódios" },
            { to: "/admin/avisos", label: "Enviar aviso" },
            { to: "/telao", label: "Abrir telão" },
            { to: "/admin/turmas", label: "Turmas" },
            { to: "/admin/series", label: "Seleções" },
            { to: "/admin/regulamento", label: "Regulamento" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-xl border border-border px-3 py-3 hover:bg-foreground/5 transition"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </AdminSection>

      <AdminSection titulo={`Edição rápida · ao vivo (${aoVivo.length})`}>
        {aoVivo.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma partida em andamento agora.
          </p>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {aoVivo.map((j) => (
              <EdicaoRapida key={j.id} jogo={j} />
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection titulo="Histórico de notificações (permanente)">
        {!historico || historico.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma notificação registrada.
          </p>
        ) : (
          <ul className="space-y-1 max-h-80 overflow-y-auto text-xs">
            {historico.map((n) => (
              <li
                key={n.id}
                className="rounded-lg bg-muted px-2 py-1.5 flex gap-2"
              >
                <div
                  className="size-5 shrink-0 grid place-items-center"
                  aria-hidden
                >
                  <img
                    src={
                      ICONE_NOTIFICACAO[n.tipo] ||
                      "/assets/notificacoes/default.png"
                    }
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block">{n.titulo}</span>
                  {n.descricao && (
                    <span className="block text-muted-foreground">
                      {n.descricao}
                    </span>
                  )}
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(n.criadoEm).toLocaleString("pt-BR")} · {n.escopo}
                    {n.autorEmail ? ` · ${n.autorEmail}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </div>
  );
}

function EdicaoRapida({ jogo }) {
  const state = useJesState();
  const { run, salvando, erro, ok } = useAdminAction();
  const [a, setA] = useState(jogo.placarA);
  const [b, setB] = useState(jogo.placarB);
  const A = turmaById(state, jogo.turmaA);
  const B = turmaById(state, jogo.turmaB);
  if (!A || !B) return null;

  const patch = (extra = {}) =>
    run(() =>
      api.atualizarJogo(jogo.id, { placarA: a, placarB: b, ...extra }, true),
    );

  return (
    <div className="rounded-xl border border-border bg-muted p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {MODALIDADES.find((m) => m.slug === jogo.modalidadeSlug)?.nome} · 📍{" "}
        {jogo.local}
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        {[
          [A.nome, a, setA],
          [B.nome, b, setB],
        ].map(([nome, valor, set]) => (
          <div key={nome} className="rounded-lg bg-muted p-2">
            <p className="text-xs font-semibold truncate">{nome}</p>
            <div className="mt-1 flex items-center gap-1">
              <button
                onClick={() => set(Math.max(0, valor - 1))}
                aria-label={`Diminuir ${nome}`}
                className="size-11 grid place-items-center rounded-lg border border-border active:scale-95"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex-1 text-center font-display text-2xl">
                {valor}
              </span>
              <button
                onClick={() => set(Math.min(999, valor + 1))}
                aria-label={`Aumentar ${nome}`}
                className="size-11 grid place-items-center rounded-lg bg-jes-green text-accent-foreground active:scale-95"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <button
          disabled={salvando}
          onClick={() => patch()}
          className={`${btnCls} text-xs`}
        >
          Salvar
        </button>
        <button
          disabled={salvando}
          onClick={() => patch({ status: "encerrado" })}
          className="px-3 min-h-11 rounded-lg text-xs border border-border hover:bg-foreground/5"
        >
          Encerrar
        </button>
      </div>
      <div className="mt-1.5">
        <Feedback erro={erro} ok={ok} />
      </div>
    </div>
  );
}
