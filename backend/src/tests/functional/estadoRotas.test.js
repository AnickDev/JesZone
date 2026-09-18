import "dotenv/config";
import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../../../app.js";

describe("Funcionalidade da API - Estado", () => {
  test("GET /api/estado deve retornar o estado completo da aplicação", async () => {
    const resposta = await request(app)
      .get("/api/estado");

    expect(resposta.status).toBe(200);

    expect(resposta.body).toHaveProperty("turmas");
    expect(resposta.body).toHaveProperty("jogos");
    expect(resposta.body).toHaveProperty("serieSelecao");
    expect(resposta.body).toHaveProperty("regulamento");
    expect(resposta.body).toHaveProperty("resultadosUnicos");

    expect(Array.isArray(resposta.body.turmas)).toBe(true);
    expect(Array.isArray(resposta.body.jogos)).toBe(true);
    expect(typeof resposta.body.serieSelecao).toBe("object");
    expect(typeof resposta.body.regulamento).toBe("object");
    expect(Array.isArray(resposta.body.resultadosUnicos)).toBe(true);
  });
});