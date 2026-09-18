import { Turma } from "../models/index.js";
import { turmaEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";
import { ErroApi } from "../utils/ErroApi.js";
import { z } from "zod";

/** Cria ou atualiza (upsert) uma turma. */
export const salvarTurma = assincrono(async (req, res) => {
  const id = z.string().min(1).max(20).parse(req.params.id);
  const dados = turmaEsquema.parse(req.body);

  await Turma.upsert({
    id,
    nome: dados.nome,
    serie: dados.serie,
    letra: dados.letra,
    categoria: dados.categoria,
    paisKey: dados.paisKey,
    juncaoCom: dados.juncaoCom ?? null,
    juncaoMotivo: dados.juncaoMotivo ?? null,
    membros: dados.membros ?? null,
  });

  res.json({ ok: true });
});

/** Remove uma turma (jogos e resultados vinculados são removidos em cascata). */
export const excluirTurma = assincrono(async (req, res) => {
  const id = z.string().min(1).max(20).parse(req.params.id);
  const linhas = await Turma.destroy({ where: { id } });
  if (!linhas) throw new ErroApi("Turma não encontrada.", 404);
  res.json({ ok: true });
});

export default { salvarTurma, excluirTurma };
