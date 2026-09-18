import { ResultadoUnico, Turma } from "../models/index.js";
import { resultadoUnicoEsquema, categoriaEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";
import { publicarNotificacao } from "../services/notificacaoService.js";
import { z } from "zod";

/** Cria ou atualiza (upsert) o pódio de uma modalidade sem confronto direto. */
export const salvarResultadoUnico = assincrono(async (req, res) => {
  const dados = resultadoUnicoEsquema.parse(req.body);

  await ResultadoUnico.upsert({
    modalidadeSlug: dados.modalidadeSlug,
    categoria: dados.categoria,
    campeaoTurmaId: dados.campeaoTurmaId,
    viceTurmaId: dados.viceTurmaId || null,
    terceiroTurmaId: dados.terceiroTurmaId || null,
    observacoes: dados.observacoes || null,
  });

  const turma = await Turma.findByPk(dados.campeaoTurmaId, { attributes: ["nome"] });

  await publicarNotificacao({
    tipo: "campeao",
    titulo: `Campeã definida: ${turma?.nome ?? dados.campeaoTurmaId}`,
    descricao: "Pódio publicado no painel da modalidade.",
    escopo: dados.categoria,
  });

  res.json({ ok: true });
});

/** Remove o pódio de uma modalidade/categoria. */
export const excluirResultadoUnico = assincrono(async (req, res) => {
  const modalidadeSlug = z.string().min(1).parse(req.query.modalidadeSlug);
  const categoria = categoriaEsquema.parse(req.query.categoria);

  await ResultadoUnico.destroy({ where: { modalidadeSlug, categoria } });

  res.json({ ok: true });
});

export default { salvarResultadoUnico, excluirResultadoUnico };
