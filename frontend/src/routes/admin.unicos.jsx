import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CATEGORIAS, catLabelCurto, MODALIDADES, resultadoUnico, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import * as api from "@/services/api.js";
import { AdminSection, btnCls, btnGhost, Feedback, inputCls, useAdminAction } from "@/lib/admin.jsx";

export const Route = createFileRoute("/admin/unicos")({
  component: AdminUnicos,
});

const UNICAS = MODALIDADES.filter((m) => m.formato === "unico");

function AdminUnicos() {
  const state = useJesState();
  const [categoria, setCategoria] = useState("Medio");
  const [slug, setSlug] = useState(UNICAS[0]?.slug ?? "xadrez");
  const atual = resultadoUnico(state, slug, categoria);
  const { run, salvando, erro, ok } = useAdminAction();

  const [campeao, setCampeao] = useState("");
  const [vice, setVice] = useState("");
  const [terceiro, setTerceiro] = useState("");
  const [obs, setObs] = useState("");

  const turmas = state.turmas.filter((t) => t.categoria === categoria);

  return (
    <div className="space-y-3">
      <AdminSection titulo="Pódio de modalidade sem confrontos">
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={inputCls}
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
            className={inputCls}
            aria-label="Modalidade"
          >
            {UNICAS.map((m) => (
              <option key={m.slug} value={m.slug}>
              {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {[
            ["🥇 Campeão", campeao, setCampeao],
            ["🥈 Vice", vice, setVice],
            ["🥉 Terceiro", terceiro, setTerceiro],
          ].map(([label, valor, set]) => (
            <label key={label} className="text-xs text-muted-foreground">
              {label}
              <select value={valor} onChange={(e) => set(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <label className="mt-2 block text-xs text-muted-foreground">
          Observações
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            maxLength={600}
            placeholder="Ex.: tempos, recordes ou detalhes da prova"
            className={inputCls}
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <button
            disabled={salvando || !campeao}
            onClick={() =>
              run(
                () =>
                  api.salvarResultadoUnico({
                    modalidadeSlug: slug,
                    categoria,
                    campeaoTurmaId: campeao,
                    viceTurmaId: vice || null,
                    terceiroTurmaId: terceiro || null,
                    observacoes: obs || null,
                  }),
                "Pódio publicado.",
              )
            }
            className={btnCls}
          >
            Publicar pódio
          </button>
          {atual && (
            <button
              disabled={salvando}
              onClick={() =>
                run(() => api.excluirResultadoUnico(slug, categoria), "Pódio removido.")
              }
              className={btnGhost}
            >
              <Trash2 className="size-4 inline mr-1" /> Remover atual
            </button>
          )}
        </div>
        <div className="mt-2">
          <Feedback erro={erro} ok={ok} />
        </div>
      </AdminSection>

      <AdminSection titulo="Pódios publicados">
        {state.resultadosUnicos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum pódio publicado ainda.</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {state.resultadosUnicos.map((r) => (
              <li
                key={`${r.modalidadeSlug}-${r.categoria}`}
                className="rounded-lg bg-muted px-2 py-1.5"
              >
                {MODALIDADES.find((m) => m.slug === r.modalidadeSlug)?.nome} ·{" "}
                {catLabelCurto(r.categoria)} — 🥇 {turmaById(state, r.campeaoTurmaId)?.nome}
                {r.viceTurmaId ? ` · 🥈 ${turmaById(state, r.viceTurmaId)?.nome}` : ""}
                {r.terceiroTurmaId ? ` · 🥉 ${turmaById(state, r.terceiroTurmaId)?.nome}` : ""}
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </div>
  );
}
