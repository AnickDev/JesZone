import "dotenv/config";
import { describe, test, expect, vi } from "vitest";
import { SerieSelecao, Turma } from "../../models/index.js";
import request from "supertest";
import app from "../../../app";

describe("Funcionalidade da Api - séries", () => {
  test("PUT api/series/: series deve rejeitar dados inválidos", async () => {
    const login = await request(app).post("/api/auth/entrar/").send({
      email: "suporte.admjeszone@sesi.senai.com.br",
      senha: "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f",
    });

    expect(login.status).toBe(200);

    const token = login.body.token;

    const resposta = await request(app)
      .delete("/api/resultados-unicos")
      .set("Authorization", `Bearer${token}`)
      .query({
        modalidadeSlug: "",
        categoria: "Medio",
      });

    expect(resposta.status).toBe(401);
    expect(resposta.body).toHaveProperty("erro");
  });
  test("PUT /api/series/:serie deve definir a seleção e atualizar as turmas", async () => {
  const serie = `T${Date.now()}`.slice(0, 8);
  const idTurma = `TESTE-${Date.now()}`.slice(0, 20);

  await Turma.create({
    id: idTurma,
    nome: "Turma Série Teste",
    serie,
    letra: "A",
    categoria: "Medio",
    paisKey: "br",
  });

  const login = await request(app)
    .post("/api/auth/entrar")
    .send({
      email: "suporte.admjeszone@sesi.senai.com.br",
      senha: "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f",
    });

  expect(login.status).toBe(200);

  const token = login.body.token;

  try {
    const resposta = await request(app)
      .put(`/api/series/${serie}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        paisKey: "pt",
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      ok: true,
    });

    const serieSalva = await SerieSelecao.findByPk(serie);

    expect(serieSalva).not.toBeNull();
    expect(serieSalva.paisKey).toBe("pt");

    const turmaAtualizada = await Turma.findByPk(idTurma);

    expect(turmaAtualizada).not.toBeNull();
    expect(turmaAtualizada.paisKey).toBe("pt");
  } finally {
    await SerieSelecao.destroy({
      where: {
        serie,
      },
    });

    await Turma.destroy({
      where: {
        id: idTurma,
      },
    });
  }
});
});
