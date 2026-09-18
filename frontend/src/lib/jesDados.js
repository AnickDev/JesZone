// Leitura dos dados do JES a partir da API do backend, com cache (TanStack Query)
// e atualização periódica (polling) no lugar do tempo real do Supabase.
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { EMPTY_STATE, paisByKey } from "./jesConfig.js";
import { buscarEstado, buscarNotificacoes } from "@/services/api.js";
import jogoIniciado from '../assets/play.png'
import resultado from '../assets/resultado.png'
import campeao from '../assets/taca.png'
import agenda from '../assets/agenda.png'
import cancelado from '../assets/cancelado.png'
import aviso from '../assets/avisos.png'
import sos from '../assets/sos3.png'

export const ICONE_NOTIFICACAO = {
  "jogo-iniciado": jogoIniciado,
  resultado: resultado,
  campeao: campeao,
  agenda: agenda,
  cancelado: cancelado,
  aviso: aviso,
  sos: sos,
};

/** Limite de notificações ativas visíveis para o usuário. */
export const MAX_NOTIFICACOES_USUARIO = 7;

/** Intervalo de atualização automática do estado (substitui o realtime do Supabase). */
const INTERVALO_ATUALIZACAO_MS = 10_000;

function mapTurma(r) {
  return {
    ...r,
    selecao: paisByKey(r.paisKey),
  };
}

// Resolve os ids em `membros` (turmas unidas para jogar juntas em alguma
// modalidade) para os objetos completos das turmas, para exibição.
function anexarMembros(turmas) {
  const porId = new Map(turmas.map((t) => [t.id, t]));
  return turmas.map((t) =>
    Array.isArray(t.membros) && t.membros.length
      ? { ...t, membrosTurmas: t.membros.map((id) => porId.get(id)).filter(Boolean) }
      : t,
  );
}

async function fetchState() {
  const estado = await buscarEstado();
  const turmas = anexarMembros(estado.turmas.map(mapTurma));
  return {
    ...estado,
    turmas,
  };
}

export const jesQueryOptions = queryOptions({
  queryKey: ["jes", "state"],
  queryFn: fetchState,
  staleTime: 8_000,
  refetchInterval: INTERVALO_ATUALIZACAO_MS,
});

export function notificacoesQueryOptions(limite, tipo) {
  return queryOptions({
    queryKey: ["jes", "notificacoes", limite ?? "todas", tipo ?? "todos-tipos"],
    queryFn: () => buscarNotificacoes(limite, tipo),
    staleTime: 8_000,
    refetchInterval: INTERVALO_ATUALIZACAO_MS,
  });
}

/** Avisos de SOS/emergência mais recentes (usado pelo balão de alerta global). */
export function sosQueryOptions() {
  return notificacoesQueryOptions(5, "sos");
}

/** Estado completo do JES com indicadores de carregamento/erro. */
export function useJes() {
  const q = useQuery(jesQueryOptions);
  return {
    state: q.data ?? EMPTY_STATE,
    carregando: q.isPending,
    erro: q.error ? q.error.message : null,
    atualizando: q.isFetching,
    recarregar: q.refetch,
  };
}

/**
 * Mantém o estado sincronizado periodicamente (polling), já que o backend
 * MySQL/Express não expõe eventos em tempo real como o Supabase.
 * Deve ser montado uma única vez (layout raiz).
 */
export function useJesRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const intervalo = setInterval(() => {
      void qc.invalidateQueries({ queryKey: ["jes", "state"] });
      void qc.invalidateQueries({ queryKey: ["jes", "notificacoes"] });
    }, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [qc]);
}
