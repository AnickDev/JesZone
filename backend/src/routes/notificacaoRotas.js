import { Router } from "express";
import { listarNotificacoes, publicarAviso } from "../controllers/notificacaoController.js";
import { autenticar } from "../middlewares/autenticar.js";
import { autenticarOpcional } from "../middlewares/autenticarOpcional.js";

const rotas = Router();

// autenticarOpcional identifica admins (via JWT) sem exigir login, para que o
// controller possa restringir avisos de SOS a quem realmente é admin.
rotas.get("/", autenticarOpcional, listarNotificacoes);
rotas.post("/", autenticar, publicarAviso);

export default rotas;
