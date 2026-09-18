import { Router } from "express";
import { obterEstado } from "../controllers/estadoController.js";

const rotas = Router();

rotas.get("/", obterEstado);

export default rotas;
