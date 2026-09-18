import { z } from "zod";

export const categoriaEsquema = z.enum(["Fundamental", "Medio"]);
export const faseEsquema = z.enum(["grupos", "oitavas", "quartas", "semi", "final", "terceiro"]);
export const statusEsquema = z.enum(["agendado", "ao-vivo", "encerrado"]);

export const jogoEntradaEsquema = z.object({
  modalidadeSlug: z.string().min(1).max(40),
  categoria: categoriaEsquema,
  turmaA: z.string().min(1).max(20),
  turmaB: z.string().min(1).max(20),
  placarA: z.number().int().min(0).max(999).default(0),
  placarB: z.number().int().min(0).max(999).default(0),
  setsA: z.number().int().min(0).max(9).nullable().optional(),
  setsB: z.number().int().min(0).max(9).nullable().optional(),
  status: statusEsquema.default("agendado"),
  data: z.string().min(4),
  local: z.string().min(1).max(60),
  fase: faseEsquema.default("grupos"),
  grupo: z.string().max(4).nullable().optional(),
});

export const turmaEsquema = z.object({
  nome: z.string().trim().min(1).max(60),
  serie: z.string().min(2).max(8),
  letra: z.string().min(1).max(2),
  categoria: categoriaEsquema,
  paisKey: z.string().min(2).max(6),
  juncaoCom: z.string().max(20).nullable().optional(),
  juncaoMotivo: z.string().max(200).nullable().optional(),
  membros: z.array(z.string().max(20)).max(50).nullable().optional(),
});

export const serieSelecaoEsquema = z.object({
  paisKey: z.string().min(2).max(6),
});

export const regulamentoEsquema = z.object({
  texto: z.string().max(8000),
});

export const criarJogosEsquema = z.object({
  jogos: z.array(jogoEntradaEsquema).min(1).max(400),
});

export const atualizarJogoEsquema = z.object({
  patch: z.object({
    placarA: z.number().int().min(0).max(999).optional(),
    placarB: z.number().int().min(0).max(999).optional(),
    setsA: z.number().int().min(0).max(9).nullable().optional(),
    setsB: z.number().int().min(0).max(9).nullable().optional(),
    status: statusEsquema.optional(),
    data: z.string().min(4).optional(),
    local: z.string().min(1).max(60).optional(),
    fase: faseEsquema.optional(),
    grupo: z.string().max(4).nullable().optional(),
    wo: z.enum(["A", "B"]).nullable().optional(),
  }),
  notificar: z.boolean().default(true),
});

export const resultadoUnicoEsquema = z.object({
  modalidadeSlug: z.string().min(1).max(40),
  categoria: categoriaEsquema,
  campeaoTurmaId: z.string().min(1).max(20),
  viceTurmaId: z.string().max(20).nullable().optional(),
  terceiroTurmaId: z.string().max(20).nullable().optional(),
  observacoes: z.string().max(600).nullable().optional(),
});

export const urgenciaSosEsquema = z.enum(["baixa", "media", "alta", "critica"]);

export const avisoEsquema = z
  .object({
    tipo: z.enum([
      "aviso",
      "agenda",
      "cancelado",
      "campeao",
      "resultado",
      "jogo-iniciado",
      "sos",
    ]),
    titulo: z.string().trim().min(3).max(160),
    descricao: z.string().trim().max(600).optional(),
    escopo: z.enum(["todos", "Fundamental", "Medio"]).default("todos"),
    // Campos exclusivos do aviso de SOS/emergência.
    sosLocal: z.string().trim().min(1).max(160).optional(),
    sosNecessidade: z.string().trim().min(1).max(300).optional(),
    sosUrgencia: urgenciaSosEsquema.optional(),
  })
  .refine((d) => d.tipo !== "sos" || !!d.sosLocal, {
    message: "Informe onde ocorreu o acidente.",
    path: ["sosLocal"],
  })
  .refine((d) => d.tipo !== "sos" || !!d.sosNecessidade, {
    message: "Informe o que ou de quem se precisa.",
    path: ["sosNecessidade"],
  })
  .refine((d) => d.tipo !== "sos" || !!d.sosUrgencia, {
    message: "Informe a urgência do chamado.",
    path: ["sosUrgencia"],
  });

export const loginEsquema = z.object({
  email: z.string().trim().min(3).max(140),
  senha: z.string().min(1).max(72),
});
