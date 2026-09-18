import { Router } from "express";
import autenticacaoRotas from "./autenticacaoRotas.js";
import estadoRotas from "./estadoRotas.js";
import turmaRotas from "./turmaRotas.js";
import serieRotas from "./serieRotas.js";
import regulamentoRotas from "./regulamentoRotas.js";
import jogoRotas from "./jogoRotas.js";
import resultadoUnicoRotas from "./resultadoUnicoRotas.js";
import notificacaoRotas from "./notificacaoRotas.js";

const rotas = Router();

rotas.use("/auth", autenticacaoRotas);
rotas.use("/estado", estadoRotas);
rotas.use("/turmas", turmaRotas);
rotas.use("/series", serieRotas);
rotas.use("/regulamento", regulamentoRotas);
rotas.use("/jogos", jogoRotas);
rotas.use("/resultados-unicos", resultadoUnicoRotas);
rotas.use("/notificacoes", notificacaoRotas);

export default rotas;
