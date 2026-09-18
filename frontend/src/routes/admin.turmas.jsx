import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import {
  allSeries,
  categoriaDaSerie,
  catLabelCurto,
  listPaises,
  paisByKey,
  serieLabel,
  TURMAS_LETRAS,
} from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import * as api from "@/services/api.js";
import { AdminSection, btnCls, btnGhost, Feedback, inputCls, useAdminAction } from "@/lib/admin.jsx";
import { TeamCard } from "@/components/TeamBadge.jsx";
import { ACCEPT_ARQUIVO, lerBlocosDoArquivo, linhasParaTurmas } from "@/lib/importArquivo.js";

export const Route = createFileRoute("/admin/turmas")({
  component: AdminTurmas,
});

function AdminTurmas() {
  const state = useJesState();
  const series = allSeries();
  const paises = listPaises();
  const { run, salvando, erro, ok } = useAdminAction();

  const [serie, setSerie] = useState(series[0]?.serie ?? "6EF");
  const [letra, setLetra] = useState(TURMAS_LETRAS[0]);
  const [paisKey, setPaisKey] = useState("br");
  const [juncaoCom, setJuncaoCom] = useState("");
  const [juncaoMotivo, setJuncaoMotivo] = useState("");

  const categoria = categoriaDaSerie(serie);
  const id = `${serie}-${letra}`;
  const nome = `${serieLabel(serie)} ${letra}`;
  const selecaoSerie = state.serieSelecao[serie];

  const criar = () =>
    run(
      () =>
        api.salvarTurma(id, {
          nome,
          serie,
          letra,
          categoria,
          paisKey: selecaoSerie ?? paisKey,
          juncaoCom: juncaoCom || null,
          juncaoMotivo: juncaoMotivo || null,
        }),
      `Turma ${nome} salva.`,
    );

  return (
    <div className="space-y-3">
      <AdminSection titulo="Cadastrar / atualizar turma">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-muted-foreground">
            Série
            <select value={serie} onChange={(e) => setSerie(e.target.value)} className={inputCls}>
              {series.map((s) => (
                <option key={s.serie} value={s.serie}>
                  {s.label} · {catLabelCurto(s.categoria)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Letra
            <select value={letra} onChange={(e) => setLetra(e.target.value)} className={inputCls}>
              {TURMAS_LETRAS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Seleção {selecaoSerie ? "(definida pela série)" : ""}
            <select
              value={selecaoSerie ?? paisKey}
              disabled={!!selecaoSerie}
              onChange={(e) => setPaisKey(e.target.value)}
              className={inputCls}
            >
              {paises.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.sel.pais}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Junção com (opcional)
            <select
              value={juncaoCom}
              onChange={(e) => setJuncaoCom(e.target.value)}
              className={inputCls}
            >
              <option value="">Nenhuma</option>
              {state.turmas
                .filter((t) => t.id !== id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Motivo da junção
            <input
              value={juncaoMotivo}
              onChange={(e) => setJuncaoMotivo(e.target.value)}
              maxLength={200}
              placeholder="Ex.: turma com poucos alunos"
              className={inputCls}
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button disabled={salvando} onClick={criar} className={btnCls}>
            Salvar {nome}
          </button>
          <span className="text-xs text-muted-foreground">
            Categoria automática: {catLabelCurto(categoria)} · Seleção:{" "}
            {paisByKey(selecaoSerie ?? paisKey).pais}
          </span>
        </div>
        <div className="mt-2">
          <Feedback erro={erro} ok={ok} />
        </div>
      </AdminSection>

      <ImportarTurmas />

      {["Fundamental", "Medio"].map((cat) => {
        const lista = state.turmas.filter((t) => t.categoria === cat);
        return (
          <AdminSection key={cat} titulo={`${catLabelCurto(cat)} · ${lista.length} turma(s)`}>
            {lista.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma turma cadastrada.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((t) => (
                  <TeamCard key={t.id} turma={t}>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.juncao ? `Junção: ${t.juncao.com}` : t.serie}
                      </span>
                      <button
                        disabled={salvando}
                        onClick={() =>
                          run(() => api.excluirTurma(t.id), `Turma ${t.nome} excluída.`)
                        }
                        aria-label={`Excluir ${t.nome}`}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TeamCard>
                ))}
              </div>
            )}
          </AdminSection>
        );
      })}
    </div>
  );
}

function ImportarTurmas() {
  const { run, salvando, erro, ok } = useAdminAction();
  const [avisos, setAvisos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const inputRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setAvisos([]);
    setResumo(null);

    await run(async () => {
      const blocos = await lerBlocosDoArquivo(file);
      const { turmas, erros } = linhasParaTurmas(blocos.turmas);

      if (turmas.length === 0) {
        throw new Error(erros[0] ?? "Nenhuma turma válida encontrada no arquivo.");
      }

      for (const t of turmas) {
        await api.salvarTurma(t.id, {
          nome: t.nome,
          serie: t.serie,
          letra: t.letra,
          categoria: t.categoria,
          paisKey: t.paisKey,
          juncaoCom: t.juncaoCom,
          juncaoMotivo: t.juncaoMotivo,
        });
      }

      setResumo(`${turmas.length} turma(s) importada(s).`);
      if (erros.length) setAvisos(erros);
    }, "Importação de turmas concluída.");
  };

  return (
    <AdminSection
      titulo="Importar Turmas"
      acao={
        <label className={`${btnGhost} flex items-center gap-1.5 cursor-pointer`}>
          <Upload className="size-4" /> Enviar arquivo
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ARQUIVO}
            className="hidden"
            onChange={onFile}
            disabled={salvando}
          />
        </label>
      }
    >
      <p className="text-xs text-muted-foreground">
        Envie um arquivo <strong>.csv</strong>, <strong>.xlsx/.xls</strong>,{" "}
        <strong>.docx</strong> ou <strong>.json</strong> com as turmas para cadastrar de uma
        vez. Pode conter outras abas/seções — só a tabela de turmas é lida. Células como
        "7ºA/B/C" cadastram as turmas 7ºA, 7ºB e 7ºC automaticamente.
      </p>
      <div className="mt-2">
        <Feedback erro={erro} ok={resumo ?? ok} />
      </div>
      {avisos.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-amber-600 max-h-40 overflow-y-auto">
          {avisos.map((a, i) => (
            <li key={i} className="rounded-lg bg-amber-500/10 px-2 py-1.5">
              {a}
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
}
