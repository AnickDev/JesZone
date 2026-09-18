import { Router } from "express";
import {
  criarJogosEmLote,
  atualizarJogo,
  excluirJogo,
  excluirJogosDaFase,
} from "../controllers/jogoController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.post("/lote", autenticar, criarJogosEmLote);
rotas.delete("/fase", autenticar, excluirJogosDaFase); // precisa vir antes de /:id
rotas.patch("/:id", autenticar, atualizarJogo);
rotas.delete("/:id", autenticar, excluirJogo);

export default rotas;
