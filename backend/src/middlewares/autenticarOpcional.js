import jwt from "jsonwebtoken";

/**
 * Igual ao middleware `autenticar`, mas não bloqueia a requisição
 * quando não há token ou quando o token é inválido/expirado.
 *
 * Se o token for válido e pertencer ao administrador,
 * disponibiliza req.admin.
 */
export function autenticarOpcional(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo === "Bearer" && token) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ["HS256"],
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE
        }
      );

      if (
        payload.email?.toLowerCase() ===
        process.env.ADMIN_EMAIL?.toLowerCase()
      ) {
        req.admin = {
          email: payload.email
        };
      }
    } catch {
      // Token ausente, inválido ou expirado:
      // continua como visitante não autenticado.
    }
  }

  next();
}

export default autenticarOpcional;