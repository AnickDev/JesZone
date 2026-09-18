import { Router } from "express";
import { entrar, verificar } from "../controllers/autenticacaoController.js";
import { autenticar } from "../middlewares/autenticar.js";

const rotas = Router();

rotas.post("/entrar", entrar);
rotas.get("/verificar", autenticar, verificar);

export default rotas;
