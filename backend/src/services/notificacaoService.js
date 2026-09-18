import { Notificacao } from "../models/index.js";

/**
 * Publica uma notificação para todos os usuários (histórico permanente).
 * Equivalente a publicarNotificacao() do backend original.
 */
export async function publicarNotificacao({
  tipo,
  titulo,
  descricao,
  escopo,
  autorEmail,
  sosLocal,
  sosNecessidade,
  sosUrgencia,
}) {
  return Notificacao.create({
    tipo,
    titulo: titulo.slice(0, 160),
    descricao: descricao ? descricao.slice(0, 600) : null,
    escopo: escopo ?? "todos",
    autorEmail: autorEmail ?? null,
    sosLocal: sosLocal ?? null,
    sosNecessidade: sosNecessidade ?? null,
    sosUrgencia: sosUrgencia ?? null,
  });
}

export default { publicarNotificacao };
