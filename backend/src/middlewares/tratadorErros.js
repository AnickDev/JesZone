import { ZodError } from "zod";
import { ValidationError as SequelizeValidationError } from "sequelize";

/**
 * Middleware global de tratamento de erros. Deve ser o último middleware
 * registrado em app.js.
 */
// eslint-disable-next-line no-unused-vars
export function tratadorErros(erro, req, res, next) {
  if (erro instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: erro.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })),
    });
  }

  if (erro instanceof SequelizeValidationError) {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: erro.errors.map((e) => ({ campo: e.path, mensagem: e.message })),
    });
  }

  const status = erro.status || erro.statusCode || 500;
  const mensagem = status === 500 ? "Erro interno do servidor." : erro.message;

  if (status === 500) {
    console.error(erro);
  }

  res.status(status).json({ erro: mensagem });
}

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: "Rota não encontrada." });
}

export default tratadorErros;
