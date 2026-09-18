import "dotenv/config";
import { describe, expect, test } from "vitest";
import request from "supertest";
import { Notificacao } from "../../models/index.js";
import app from "../../../app.js";

describe("Funcionalidade da API - Notificações", () => {
  test("POST /api/notificacoes deve rejeitar dados inválidos", async () => {
    const login = await request(app)
      .post("/api/auth/entrar")
      .send({
        email: "suporte.admjeszone@sesi.senai.com.br",
        senha: "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f",
      });

    expect(login.status).toBe(200);

    const token = login.body.token;

    const resposta = await request(app)
      .post("/api/notificacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "aviso",
        titulo: "",
        descricao: "Notificação inválida para teste",
        escopo: "todos",
      });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toHaveProperty("erro");
  });
  test("POST /api/notificacoes deve publicar uma notificação válida", async () => {
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
      .post("/api/notificacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "aviso",
        titulo: "Aviso de teste",
        descricao: "Notificação criada durante teste automatizado",
        escopo: "todos",
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({
      ok: true,
    });

    const notificacao = await Notificacao.findOne({
      where: {
        titulo: "Aviso de teste",
      },
      order: [["criado_em", "DESC"]],
    });

    expect(notificacao).not.toBeNull();
    expect(notificacao.tipo).toBe("aviso");
    expect(notificacao.descricao).toBe(
      "Notificação criada durante teste automatizado",
    );
  } finally {
    await Notificacao.destroy({
      where: {
        titulo: "Aviso de teste",
      },
    });
  }
});
});