import "dotenv/config";
import { describe, expect, vi, test } from "vitest";
import request from "supertest";
import { Regulamento } from "../../models/index.js";
import app from "../../../app.js";

describe("Funcionalidade da API - Regulamento", () => {
  test("PUT /api/regulamento/:chave deve rejeitar dados inválidos de texto de token", async () => {
    const login = await request(app).post("/api/auth/entrar").send({
      email: "suporte.admjeszone@sesi.senai.com.br",
      senha: "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f",
    });
    
    expect(login.status).toBe(200);

    const token = login.body.token;

    const resposta = await request(app)
      .put("/api/regulamento/teste")
      .set("Authorization", `Bearer ${token}`)
      .send({
        texto: 12345,
      });
      
    expect(resposta.status).toBe(400);
    expect(resposta.body).toHaveProperty("erro");
  });
  test("PUT /api/regulamento/:chave deve salvar um regulamento válido", async () => {
  const chave = `teste-${Date.now()}`;

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
      .put(`/api/regulamento/${chave}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        texto: "Texto de regulamento criado durante teste automatizado.",
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      ok: true,
    });

    const regulamento = await Regulamento.findByPk(chave);

    expect(regulamento).not.toBeNull();
    expect(regulamento.texto).toBe(
      "Texto de regulamento criado durante teste automatizado.",
    );
  } finally {
    await Regulamento.destroy({
      where: {
        chave,
      },
    });
  }
});
});
