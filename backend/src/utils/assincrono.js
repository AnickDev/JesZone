/**
 * Envolve um controller assíncrono, encaminhando qualquer erro para o
 * middleware global de tratamento de erros (evita try/catch repetido).
 */
export function assincrono(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default assincrono;
