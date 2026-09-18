import { SerieSelecao, Turma } from "../models/index.js";
import { serieSelecaoEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";
import { z } from "zod";

/**
 * Define a seleção/país de uma série e propaga a mudança para todas as
 * turmas dessa série (mesmo comportamento do backend original).
 */
export const definirSerieSelecao = assincrono(async (req, res) => {
  const serie = z.string().min(2).max(8).parse(req.params.serie);
  const { paisKey } = serieSelecaoEsquema.parse(req.body);

  await SerieSelecao.upsert({ serie, paisKey });
  await Turma.update({ paisKey }, { where: { serie } });

  res.json({ ok: true });
});

export default { definirSerieSelecao };
