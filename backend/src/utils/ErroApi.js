/**
 * Erro de aplicação com status HTTP associado, usado pelos controllers
 * e capturado pelo middleware global de tratamento de erros.
 */
export class ErroApi extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

export default ErroApi;
