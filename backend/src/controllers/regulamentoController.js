import { Regulamento } from "../models/index.js";
import { regulamentoEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";
import { z } from "zod";

/** Cria ou atualiza (upsert) o texto de uma seção do regulamento. */
export const salvarRegulamento = assincrono(async (req, res) => {
  const chave = z.string().min(1).max(40).parse(req.params.chave);
  const { texto } = regulamentoEsquema.parse(req.body);

  await Regulamento.upsert({ chave, texto });

  res.json({ ok: true });
});

export default { salvarRegulamento };
