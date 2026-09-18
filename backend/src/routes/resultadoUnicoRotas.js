import { Router } from "express";
import {
  salvarResultadoUnico,
  excluirResultadoUnico,
} from "../controllers/resultadoUnicoController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.put("/", autenticar, salvarResultadoUnico);
rotas.delete("/", autenticar, excluirResultadoUnico);

export default rotas;
