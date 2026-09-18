import { Router } from "express";
import { definirSerieSelecao } from "../controllers/serieController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.put("/:serie", autenticar, definirSerieSelecao);

export default rotas;
