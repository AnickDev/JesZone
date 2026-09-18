import { Notificacao } from "../models/index.js";
import { avisoEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";
import { publicarNotificacao } from "../services/notificacaoService.js";
import { z } from "zod";

/**
 * Lista as notificações mais recentes (histórico público).
 * Avisos de SOS/emergência são exclusivos do painel administrativo: quem não
 * está autenticado como admin (req.admin, validado via JWT em
 * autenticarOpcional) nunca recebe notificações do tipo "sos" na resposta.
 */
export const listarNotificacoes = assincrono(async (req, res) => {
  const limite = req.query.limite ? z.coerce.number().int().positive().parse(req.query.limite) : undefined;

  const tipo = req.query.tipo ? z.string().min(1).parse(req.query.tipo) : undefined;

  const souAdmin = Boolean(req.admin);

  const notificacoes = await Notificacao.findAll({
    where: tipo ? { tipo } : undefined,
    order: [["criado_em", "DESC"]],
    limit: limite,
  });

  const visiveis = souAdmin ? notificacoes : notificacoes.filter((n) => n.tipo !== "sos");

  res.json(
    visiveis.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      descricao: n.descricao,
      escopo: n.escopo,
      autorEmail: n.autorEmail,
      sosLocal: n.sosLocal,
      sosNecessidade: n.sosNecessidade,
      sosUrgencia: n.sosUrgencia,
      criadoEm: n.criado_em ?? n.createdAt,
    })),
  );
});

/** Publica um aviso manual da organização (agenda, cancelamento, aviso geral, SOS, etc.). */
export const publicarAviso = assincrono(async (req, res) => {
  const dados = avisoEsquema.parse(req.body);

  await publicarNotificacao({
    tipo: dados.tipo,
    titulo: dados.titulo,
    descricao: dados.descricao || null,
    escopo: dados.escopo,
    autorEmail: req.admin?.email,
    sosLocal: dados.sosLocal,
    sosNecessidade: dados.sosNecessidade,
    sosUrgencia: dados.sosUrgencia,
  });

  res.status(201).json({ ok: true });
});

export default { listarNotificacoes, publicarAviso };
