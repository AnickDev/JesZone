import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Turma,
  SerieSelecao,
  Regulamento,
  Jogo,
  ResultadoUnico,
  Notificacao,
} from "../models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Arquivo versionado junto com o projeto que carrega os dados já cadastrados. */
export const ARQUIVO_DADOS = path.resolve(__dirname, "../../dados/dados-jes.json");

/**
 * Tabelas que compõem um "snapshot" dos dados, na ordem em que devem ser
 * gravadas: turmas e séries primeiro, porque jogos e resultados apontam para
 * turmas (chave estrangeira). Na exportação a ordem é irrelevante; na
 * importação ela evita erro de FK.
 */
export const TABELAS = [
  { chave: "turmas", model: Turma },
  { chave: "serieSelecao", model: SerieSelecao },
  { chave: "regulamento", model: Regulamento },
  { chave: "jogos", model: Jogo },
  { chave: "resultadosUnicos", model: ResultadoUnico },
  { chave: "notificacoes", model: Notificacao },
];

/**
 * Colunas do tipo JSON (ex.: `turmas.membros`) podem voltar do banco já como
 * objeto ou ainda como texto, dependendo do driver. Sem normalizar, um valor
 * que volta como texto seria gravado de novo como texto dentro de JSON,
 * gerando codificação dupla e quebrando a leitura das turmas unidas.
 */
export function normalizarRegistro(model, registro) {
  const saida = { ...registro };
  for (const [nome, atributo] of Object.entries(model.getAttributes())) {
    const tipo = atributo.type?.key ?? atributo.type?.constructor?.key;
    if (tipo !== "JSON" && tipo !== "JSONB") continue;
    const valor = saida[nome];
    if (typeof valor !== "string") continue;
    try {
      let parsed = JSON.parse(valor);
      // Tolera valores que já vieram com codificação dupla de execuções antigas.
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      saida[nome] = parsed;
    } catch {
      // Não é JSON válido: mantém como está em vez de perder o dado.
    }
  }
  return saida;
}
