import { describe, expect, test, vi } from "vitest";
import { entrar, verificar } from "../../controllers/autenticacaoController.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "token-falso"),
  },
}));

describe.skip("entrar", () => {
  test("deve realizar login com credenciais válidas", async () => {
    const req = {
      body: {
        email: process.env.ADMIN_EMAIL,
        senha: process.env.ADMIN_PASSWORD,
      },
    };

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    const next = vi.fn();

    entrar(req, res, next);
    // expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("deve rejeitar login com credenciais inválidas", async () => {
    const req = {
      body: {
        email: "usuario@errado.com",
        senha: "senha-errada",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    entrar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("deve rejeitar dados de login inválidos", async () => {
    const req = {
      body: {
        email: "",
        senha: "123456",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await entrar(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe.skip("verificar", () => {
  test("deve retornar os dados do administrador autenticado", async () => {
    const req = {
      admin: {
        id: "admin-1",
        email: "admin@jes.com",
      },
    };

    const res = {
      json: vi.fn(),
    };

    const next = vi.fn();

    await verificar(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      admin: true,
      email: "admin@jes.com",
    });

    expect(next).not.toHaveBeenCalled();
  });
});
