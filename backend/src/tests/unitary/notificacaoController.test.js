import { describe, expect, test, beforeEach, vi } from "vitest";
import { listarNotificacoes, publicarAviso } from "../../controllers/notificacaoController.js";
import { publicarNotificacao } from "../../services/notificacaoService.js";
import { Notificacao } from "../../models/index.js";

vi.mock("../../models/index.js", () => ({
    Notificacao:{
        findAll: vi.fn()
    }
}))

vi.mock("../../services/notificacaoService.js", () => ({
  publicarNotificacao: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks()
})

describe("listarNotificacoes", () => {
  test("deve listar as notificações corretamente", async () => {
    Notificacao.findAll.mockResolvedValue([
      {
        id: 1,
        tipo: "aviso",
        titulo: "Jogo iniciado",
        mensagem: "A partida começou.",
      },
    ]);

    const req = {
      query: {},
    };

    const res = {
      json: vi.fn(),
    };

    const next = vi.fn();

    await listarNotificacoes(req, res, next);

    expect(Notificacao.findAll).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
  });

  test("deve listar notificações vazias quando os filtros não são reconhecidos", async () => {
  Notificacao.findAll.mockResolvedValue([]);

  const req = {
    query: {
      limit: "valor-invalido",
    },
  };

  const res = {
    json: vi.fn(),
  };

  const next = vi.fn();

  await listarNotificacoes(req, res, next);

  expect(Notificacao.findAll).toHaveBeenCalledWith({
    limit: undefined,
    where: undefined,
    order: [["criado_em", "DESC"]],
  });

  expect(res.json).toHaveBeenCalled();
  expect(next).not.toHaveBeenCalled();
});
});
describe("publicarAviso", () => {
  test("deve publicar um aviso com dados válidos", async () => {
    publicarNotificacao.mockResolvedValue();

    const req = {
      body: {
        tipo: "aviso",
        titulo: "Jogo iniciado",
        mensagem: "A partida começou.",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await publicarAviso(req, res, next);

    expect(publicarNotificacao).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
  });
  test("não deve publicar um aviso quando os dados forem inválidos", async () => {
  const req = {
    body: {
      tipo: "",
      titulo: "",
      mensagem: "",
    },
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  const next = vi.fn();

  await publicarAviso(req, res, next);

  await new Promise((resolve) => setImmediate(resolve));

  expect(publicarNotificacao).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();

  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});
});