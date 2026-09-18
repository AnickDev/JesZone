import { Turma, Jogo, SerieSelecao, Regulamento, ResultadoUnico } from "../models/index.js";
import { assincrono } from "../utils/assincrono.js";

function mapTurma(t, serieSelecao) {
  return {
    id: t.id,
    nome: t.nome,
    serie: t.serie,
    letra: t.letra,
    categoria: t.categoria,
    paisKey: serieSelecao[t.serie] ?? t.paisKey,
    juncao: t.juncaoCom
      ? { com: t.juncaoCom, motivo: t.juncaoMotivo ?? "" }
      : undefined,
    membros:
      Array.isArray(t.membros) && t.membros.length
        ? t.membros
        : null,
  };
}

function mapJogo(j) {
  return {
    id: j.id,
    modalidadeSlug: j.modalidadeSlug,
    categoria: j.categoria,
    turmaA: j.turmaA,
    turmaB: j.turmaB,
    placarA: j.placarA,
    placarB: j.placarB,
    setsA: j.setsA,
    setsB: j.setsB,
    status: j.status,
    data: j.data,
    local: j.local,
    wo: j.wo ?? null,
    fase: j.fase,
    grupo: j.grupo,
  };
}

function mapResultadoUnico(r) {
  return {
    modalidadeSlug: r.modalidadeSlug,
    categoria: r.categoria,
    campeaoTurmaId: r.campeaoTurmaId,
    viceTurmaId: r.viceTurmaId,
    terceiroTurmaId: r.terceiroTurmaId,
    observacoes: r.observacoes,
    atualizadoEm: r.atualizado_em ?? r.atualizadoEm,
  };
}

/** Estado público completo do JES: turmas, jogos, seleções, regulamento e resultados. */
export const obterEstado = assincrono(async (req, res) => {
  const [turmas, jogos, series, regulamento, unicos] = await Promise.all([
    Turma.findAll({ order: [["serie", "ASC"], ["letra", "ASC"]] }),
    Jogo.findAll({ order: [["data", "ASC"]] }),
    SerieSelecao.findAll(),
    Regulamento.findAll(),
    ResultadoUnico.findAll(),
  ]);

  const serieSelecao = Object.fromEntries(
  series.map((s) => [s.serie, s.paisKey])
);

res.json({
  turmas: turmas.map((t) => mapTurma(t, serieSelecao)),
  jogos: jogos.map(mapJogo),
  serieSelecao,
  regulamento: Object.fromEntries(
    regulamento.map((r) => [r.chave, r.texto])
  ),
  resultadosUnicos: unicos.map(mapResultadoUnico),
});
});

export default { obterEstado };
