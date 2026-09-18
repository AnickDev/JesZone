import { Router } from "express";
import { salvarTurma, excluirTurma } from "../controllers/turmaController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.put("/:id", autenticar, salvarTurma);
rotas.delete("/:id", autenticar, excluirTurma);

export default rotas;
