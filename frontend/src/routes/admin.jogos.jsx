import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Upload, Wand2 } from "lucide-react";
import {
  CATEGORIAS,
  catLabelCurto,
  FASE_LABEL,
  MODALIDADES,
  turmaById,
} from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { previewTabela, LOCAL_AUTOMATICO } from "@/lib/scheduler.js";
import {
  previewMataMata,
  statusMataMata,
  jogosMataMata,
} from "@/lib/bracket.js";
import { nomesLocaisDaModalidade } from "@/lib/locais.js";
import {
  ACCEPT_ARQUIVO,
  lerBlocosDoArquivo,
  linhasParaConfrontos,
} from "@/lib/importArquivo.js";
import * as api from "@/services/api.js";
import {
  AdminSection,
  btnCls,
  btnGhost,
  Feedback,
  inputCls,
  selectCls,
  useAdminAction,
} from "@/lib/admin.jsx";

export const Route = createFileRoute("/admin/jogos")({
  component: AdminJogos,
});

const FASES = ["grupos", "oitavas", "quartas", "semi", "final", "terceiro"];

function AdminJogos() {
  const state = useJesState();
  const [categoria, setCategoria] = useState("Medio");
  const [slug, setSlug] = useState(
    MODALIDADES.find((m) => m.formato === "confrontos")?.slug ?? "fut7-m",
  );
  const [inicio, setInicio] = useState(() =>
    new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 16),
  );
  const [intervalo, setIntervalo] = useState(30);
  const [local, setLocal] = useState(LOCAL_AUTOMATICO);
  const { run, salvando, erro, ok } = useAdminAction();

  // Quadras/espaços cadastrados no mapa do evento para a modalidade selecionada.
  const locaisModalidade = useMemo(() => nomesLocaisDaModalidade(slug), [slug]);

  // Se a modalidade mudar e o local escolhido não existir mais para ela, volta ao automático.
  useEffect(() => {
    if (local !== LOCAL_AUTOMATICO && !locaisModalidade.includes(local)) {
      setLocal(LOCAL_AUTOMATICO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const locaisSelecionados =
    local === LOCAL_AUTOMATICO ? locaisModalidade : [local];

  const prev = useMemo(
    () =>
      previewTabela(state, slug, categoria, {
        inicio: new Date(inicio),
        intervaloMin: intervalo,
        locais: locaisSelecionados,
      }),
    [state, slug, categoria, inicio, intervalo, locaisSelecionados.join("|")],
  );

  const mm = statusMataMata(state, slug, categoria);
  const prevMM = previewMataMata(state, slug, categoria, {
    inicio: new Date(inicio),
    intervaloMin: 60,
    locais: locaisSelecionados,
  });
  const jogosDaModalidade = state.jogos
    .filter((j) => j.modalidadeSlug === slug && j.categoria === categoria)
    .sort((a, b) => +new Date(a.data) - +new Date(b.data));

  const nome = (id) => turmaById(state, id)?.nome ?? id;

  return (
    <div className="space-y-3">
      <AdminSection titulo="Configuração">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
            {MODALIDADES.filter((m) => m.formato === "confrontos").map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className={inputCls}
            aria-label="Início dos jogos"
          />
          <div className="flex items-center rounded-xl bg-[#f1f3f4] px-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
            {/* Texto pra colocar colocar antes do número */}
            <span className="text-gray-500 pr-1 select-none whitespace-nowrap">
              Intervalo:
            </span>

            <input
              type="number"
              min={10}
              max={240}
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value) || 10)}
              className={`${inputCls} border-none bg-transparent outline-none focus:ring-0 w-full`}
              aria-label="Intervalo em minutos"
            />
          </div>
          <select
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className={selectCls}
            aria-label="Local"
          >
            <option value={LOCAL_AUTOMATICO}>
              {locaisModalidade.length > 1
                ? "Distribuir automaticamente entre as quadras"
                : "Automático"}
            </option>
            {locaisModalidade.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {locaisModalidade.length > 1 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Esta modalidade tem {locaisModalidade.length} quadras:{" "}
            {locaisModalidade.join(", ")}.{" "}
            {local === LOCAL_AUTOMATICO
              ? "Os jogos serão distribuídos entre elas automaticamente."
              : `Todos os jogos gerados agora usarão apenas "${local}".`}
          </p>
        )}
        <div className="mt-2">
          <Feedback erro={erro} ok={ok} />
        </div>
      </AdminSection>

      <AdminSection
        titulo={`Fase de grupos · ${prev.length} confronto(s) pendente(s)`}
        acao={
          <button
            disabled={salvando || prev.length === 0}
            onClick={() =>
              run(
                () =>
                  api.criarJogos(
                    prev.map((p) => ({
                      modalidadeSlug: slug,
                      categoria,
                      turmaA: p.turmaA,
                      turmaB: p.turmaB,
                      placarA: 0,
                      placarB: 0,
                      status: "agendado",
                      data: p.data,
                      local: p.local,
                      fase: "grupos",
                      grupo: p.grupo,
                    })),
                  ),
                "Tabela gerada e publicada.",
              )
            }
            className={`${btnCls} flex items-center gap-1.5`}
          >
            <Wand2 className="size-4" /> Gerar
          </button>
        }
      >
        {prev.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Todos os confrontos de grupo já estão criados para esta modalidade.
          </p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto text-xs">
            {prev.map((p, i) => (
              <li
                key={i}
                className="flex justify-between gap-2 rounded-lg bg-muted px-2 py-1.5"
              >
                <span className="truncate">
                  Grupo {p.grupo} · {nome(p.turmaA)} x {nome(p.turmaB)}
                </span>
                <span className="text-muted-foreground shrink-0">
                  📍 {p.local} ·{" "}
                  {new Date(p.data).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      <ImportarConfrontos
        state={state}
        categoria={categoria}
        slug={slug}
        inicio={inicio}
        intervalo={intervalo}
        locaisModalidade={locaisModalidade}
      />

      <AdminSection
        titulo="Mata-mata"
        acao={
          <div className="flex gap-1.5">
            <button
              disabled={salvando || prevMM.length === 0}
              onClick={() =>
                run(
                  () =>
                    api.criarJogos(
                      prevMM.map((p) => ({
                        modalidadeSlug: slug,
                        categoria,
                        turmaA: p.turmaA,
                        turmaB: p.turmaB,
                        placarA: 0,
                        placarB: 0,
                        status: "agendado",
                        data: p.data,
                        local: p.local,
                        fase: p.fase,
                        grupo: null,
                      })),
                    ),
                  "Chaveamento publicado.",
                )
              }
              className={btnCls}
            >
              Gerar chave
            </button>
            {jogosMataMata(state, slug, categoria).length > 0 && (
              <button
                disabled={salvando}
                onClick={() =>
                  run(
                    () => api.excluirJogosDaFase(slug, categoria),
                    "Mata-mata removido.",
                  )
                }
                className={btnGhost}
              >
                Refazer
              </button>
            )}
          </div>
        }
      >
        <p className="text-xs text-muted-foreground">
          Grupos encerrados: {mm.encerradosGrupos}/{mm.jogosGrupos}.{" "}
          {mm.prontoParaMataMata
            ? "Pronto para o mata-mata."
            : "Finalize a fase de grupos para liberar a chave."}{" "}
        </p>
        {prevMM.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs">
            {prevMM.map((p, i) => (
              <li key={i} className="rounded-lg bg-muted px-2 py-1.5">
                {FASE_LABEL[p.fase]} · {nome(p.turmaA)} x {nome(p.turmaB)} · 📍{" "}
                {p.local}
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      <JogoManual
        state={state}
        categoria={categoria}
        slug={slug}
        locaisModalidade={locaisModalidade}
        inicioPadrao={inicio}
      />

      <AdminSection titulo={`Jogos cadastrados (${jogosDaModalidade.length})`}>
        {jogosDaModalidade.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum jogo cadastrado.
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {jogosDaModalidade.map((j) => (
              <li key={j.id} className="rounded-lg bg-muted px-2 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {j.fase === "grupos"
                      ? `Grupo ${j.grupo ?? "-"}`
                      : FASE_LABEL[j.fase]}{" "}
                    · {nome(j.turmaA)} {j.placarA} x {j.placarB}{" "}
                    {nome(j.turmaB)}
                  </span>
                  <button
                    disabled={salvando}
                    onClick={() =>
                      run(() => api.excluirJogo(j.id), "Jogo excluído.")
                    }
                    aria-label="Excluir jogo"
                    className="size-9 grid place-items-center rounded hover:bg-destructive/10 text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  <input
                    type="datetime-local"
                    defaultValue={new Date(j.data).toISOString().slice(0, 16)}
                    aria-label="Data e hora do jogo"
                    className={inputCls}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      void run(
                        () =>
                          api.atualizarJogo(
                            j.id,
                            { data: new Date(v).toISOString() },
                            false,
                          ),
                        "Horário atualizado.",
                      );
                    }}
                  />
                  <select
                    defaultValue={j.local}
                    aria-label="Local do jogo"
                    className={selectCls}
                    onChange={(e) =>
                      void run(
                        () =>
                          api.atualizarJogo(
                            j.id,
                            { local: e.target.value },
                            false,
                          ),
                        "Local atualizado.",
                      )
                    }
                  >
                    {[
                      j.local,
                      ...locaisModalidade.filter((l) => l !== j.local),
                    ].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </div>
  );
}

function ImportarConfrontos({
  state,
  categoria,
  slug,
  inicio,
  intervalo,
  locaisModalidade,
}) {
  const { run, salvando, erro, ok } = useAdminAction();
  const [avisos, setAvisos] = useState([]);
  const inputRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setAvisos([]);

    await run(async () => {
      const blocos = await lerBlocosDoArquivo(file);
      const turmasDaCategoria = state.turmas.filter(
        (t) => t.categoria === categoria,
      );
      const { confrontos, erros, turmasNovas, unioes } = linhasParaConfrontos(
        blocos.confrontos,
        {
          turmas: turmasDaCategoria,
          serieSelecao: state.serieSelecao,
          locaisPadrao: locaisModalidade,
          inicio: +new Date(inicio),
          intervaloMin: intervalo,
        },
      );

      if (confrontos.length === 0) {
        throw new Error(
          erros[0] ?? "Nenhum confronto válido encontrado no arquivo.",
        );
      }

      // Turmas citadas no arquivo que ainda não existiam são cadastradas
      // primeiro; em seguida, as "turmas-união" (ex.: 7ºA/B/C jogando juntas)
      // são criadas reunindo todas as turmas que as compõem.
      for (const t of [...turmasNovas, ...unioes]) {
        await api.salvarTurma(t.id, {
          nome: t.nome,
          serie: t.serie,
          letra: t.letra,
          categoria: t.categoria,
          paisKey: t.paisKey,
          membros: t.membros ?? null,
        });
      }

      await api.criarJogos(
        confrontos.map((c) => ({
          modalidadeSlug: slug,
          categoria,
          turmaA: c.turmaA,
          turmaB: c.turmaB,
          placarA: 0,
          placarB: 0,
          status: "agendado",
          data: c.data,
          local: c.local,
          fase: c.fase ?? "grupos",
          grupo: c.fase === "grupos" ? c.grupo : null,
        })),
      );

      if (erros.length) setAvisos(erros);
    }, "Chaveamento importado e publicado.");
  };

  return (
    <AdminSection
      titulo="Importar Chaveamento"
      acao={
        <label
          className={`${btnGhost} flex items-center gap-1.5 cursor-pointer`}
        >
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
        <strong>.docx</strong> ou <strong>.json</strong> com o chaveamento para
        a modalidade e categoria selecionadas acima. Pode conter outras
        abas/seções — só a tabela de confrontos é lida. Lados compostos como
        "7ºA/B/C X 7ºD/E/F" criam automaticamente as turmas que faltarem e uma
        turma-união para cada lado (sem limite de turmas unidas).
      </p>
      <div className="mt-2">
        <Feedback erro={erro} ok={ok} />
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

function JogoManual({
  state,
  categoria,
  slug,
  locaisModalidade,
  inicioPadrao,
}) {
  const { run, salvando, erro, ok } = useAdminAction();
  const turmas = state.turmas
    .filter((t) => t.categoria === categoria)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [fase, setFase] = useState("grupos");
  const [grupo, setGrupo] = useState("");
  const [quando, setQuando] = useState(inicioPadrao);
  const [onde, setOnde] = useState(locaisModalidade[0] ?? "Quadra 1");

  useEffect(() => {
    if (!locaisModalidade.includes(onde))
      setOnde(locaisModalidade[0] ?? "Quadra 1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locaisModalidade.join("|")]);

  const valido = a && b && a !== b;

  return (
    <AdminSection titulo="Criar jogo manualmente">
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={a}
          onChange={(e) => setA(e.target.value)}
          className={selectCls}
          aria-label="Turma A"
        >
          <option value="">Turma A…</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} · {t.selecao.pais}
            </option>
          ))}
        </select>
        <select
          value={b}
          onChange={(e) => setB(e.target.value)}
          className={selectCls}
          aria-label="Turma B"
        >
          <option value="">Turma B…</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} · {t.selecao.pais}
            </option>
          ))}
        </select>
        <select
          value={fase}
          onChange={(e) => setFase(e.target.value)}
          className={selectCls}
          aria-label="Fase"
        >
          {FASES.map((f) => (
            <option key={f} value={f}>
              {FASE_LABEL[f]}
            </option>
          ))}
        </select>
        <input
          value={grupo}
          onChange={(e) => setGrupo(e.target.value.toUpperCase().slice(0, 2))}
          placeholder="Grupo (só na fase de grupos)"
          aria-label="Grupo"
          className={inputCls}
          disabled={fase !== "grupos"}
        />
        <input
          type="datetime-local"
          value={quando}
          onChange={(e) => setQuando(e.target.value)}
          aria-label="Data e hora"
          className={inputCls}
        />
        <select
          value={onde}
          onChange={(e) => setOnde(e.target.value)}
          className={selectCls}
          aria-label="Local"
        >
          {locaisModalidade.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          disabled={salvando || !valido}
          onClick={() =>
            run(
              () =>
                api.criarJogos([
                  {
                    modalidadeSlug: slug,
                    categoria,
                    turmaA: a,
                    turmaB: b,
                    placarA: 0,
                    placarB: 0,
                    status: "agendado",
                    data: new Date(quando).toISOString(),
                    local: onde,
                    fase,
                    grupo: fase === "grupos" ? grupo || null : null,
                  },
                ]),
              "Jogo criado.",
            )
          }
          className={btnCls}
        >
          Criar jogo
        </button>
        {!valido && (
          <span className="text-xs text-muted-foreground">
            Escolha duas turmas diferentes.
          </span>
        )}
      </div>
      <div className="mt-2">
        <Feedback erro={erro} ok={ok} />
      </div>
    </AdminSection>
  );
}
