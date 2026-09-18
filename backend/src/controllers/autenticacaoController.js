import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { loginEsquema } from "../utils/esquemas.js";
import { assincrono } from "../utils/assincrono.js";

/**
 * Login tradicional (e-mail + senha definidos em variáveis de ambiente).
 * Não há envio de link/código por e-mail — as credenciais são validadas
 * diretamente no backend e, se corretas, um JWT é retornado.
 */
export const entrar = assincrono(async (req, res) => {
  const { email, senha } = loginEsquema.parse(req.body);
  
  const emailValido = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const senhaValida = await bcrypt.compare(senha, process.env.ADMIN_PASSWORD).catch(err => console.log(err))

  if (!emailValido || !senhaValida) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

 const token = jwt.sign(
    {
        email: process.env.ADMIN_EMAIL
    },
    process.env.JWT_SECRET,
    {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
    }
);

  res.json({ token, email: process.env.ADMIN_EMAIL });
});

/** Confirma que o token enviado ainda é válido (usado pelo layout do painel). */
export const verificar = assincrono(async (req, res) => {
  res.json({ admin: true, email: req.admin.email });
});

export default { entrar, verificar };
