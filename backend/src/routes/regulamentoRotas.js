import { Router } from "express";
import { salvarRegulamento } from "../controllers/regulamentoController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.put("/:chave", autenticar, salvarRegulamento);

export default rotas;
