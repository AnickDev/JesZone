import { test, expect, test, vi, describe, beforeEach, mockResolvedValue } from "vitest";

import { 
    salvarTurma,
    excluirTurma
 } from "../../controllers/turmaController.js";
import { Turma } from "../../models/index.js";
import { json } from "sequelize";

//Eu utilizei mock para isolar o controller da camada de persistência, permitindo testar o comportamento do controller sem depender do banco de dados
vi.mock("../../models/index.js", () => ({
  Turma: {
    upsert: vi.fn(),
     destroy: vi.fn(),
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
}); //zerando histórico de chamadas 

describe("Salvar Turma", () => {
  test("deve salvar uma turma com dados válidos", async () => {
    const req = {
      params: {
        id: "MEDIO-A",
      },
      body: {
        nome: "Turma A",
        serie: "2ANO",
        letra: "A",
        categoria: "Medio",
        paisKey: "BR",
      },
    };

    const res = {
      json: vi.fn(),
    };

    const next = vi.fn();

    await salvarTurma(req, res, next);

    expect(Turma.upsert).toHaveBeenCalledWith({
      id: "MEDIO-A",
      nome: "Turma A",
      serie: "2ANO",
      letra: "A",
      categoria: "Medio",
      paisKey: "BR",
      juncaoCom: null,
      juncaoMotivo: null,
      membros: null
    });
    //Futuramente criar um teste para a junção de turmas e motivo.

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("não deve salvar turma quando o ID for inválido", async () => {
      const req = {
    params: {
      id: "",
    },
    body: {
      nome: "Turma A",
      serie: "2ANO",
      letra: "A",
      categoria: "Medio",
      paisKey: "BR",
    },
  };

  const res = {
    json: vi.fn()
  }

  const next = vi.fn()

  await salvarTurma(req, res, next)

  expect(Turma.upsert).not.toHaveBeenCalled()

  expect(next).toHaveBeenCalled()
  })

  test("não deve salvar uma turma quando os dados forem inválidos", async () => {

  const req = {
    params: {
      id: "MEDIO-A",
    },
    body: {
      nome: "",
      serie: "2ANO",
      letra: "A",
      categoria: "Medio",
      paisKey: "BR",
    },
  };

  const res = {
    json: vi.fn(),
  };

  const next = vi.fn();

  await salvarTurma(req, res, next);

  expect(Turma.upsert).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
});

test("deve preservar os dados de junção quando informados", async () => {
  const req = {
    params: { id: "MEDIO-A" },
    body: {
      nome: "Turma A",
      serie: "2ANO",
      letra: "A",
      categoria: "Medio",
      paisKey: "BR",
      juncaoCom: "MEDIO-B",
      juncaoMotivo: "Quantidade insuficiente",
      membros: null
    },
  };

  const res = { json: vi.fn() };
  const next = vi.fn();

  await salvarTurma(req, res, next);

  expect(Turma.upsert).toHaveBeenCalledWith({
    id: "MEDIO-A",
    nome: "Turma A",
    serie: "2ANO",
    letra: "A",
    categoria: "Medio",
    paisKey: "BR",
    juncaoCom: "MEDIO-B",
    juncaoMotivo: "Quantidade insuficiente",
    membros: null
  });

  expect(res.json).toHaveBeenCalledWith({ ok: true });
  expect(next).not.toHaveBeenCalled();
});

});

describe("excluirTurma", () => {
   describe("excluirTurma", () => {
  test("deve excluir uma turma existente", async () => {
    Turma.destroy.mockResolvedValue(1);

    const req = {
      params: { id: "MEDIO-A" },
    };

    const res = {
      json: vi.fn(),
    };

    const next = vi.fn();

    await excluirTurma(req, res, next);

    expect(Turma.destroy).toHaveBeenCalledWith({
      where: { id: "MEDIO-A" },
    });

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });
});

test("deve retornar erro quando a turma não existir", async () => {
  Turma.destroy.mockResolvedValue(0);

  const req = {
    params: { id: "TURMA-INEXISTENTE" },
  };

  const res = {
    json: vi.fn(),
  };

  const next = vi.fn();

  await excluirTurma(req, res, next);

  await new Promise((resolve) => setImmediate(resolve));

  expect(Turma.destroy).toHaveBeenCalledWith({
    where: { id: "TURMA-INEXISTENTE" },
  });

  expect(next).toHaveBeenCalled();

  const erro = next.mock.calls[0][0];

  expect(erro.message).toBe("Turma não encontrada.");
  expect(erro.status).toBe(404);

  expect(res.json).not.toHaveBeenCalled();
});
})
