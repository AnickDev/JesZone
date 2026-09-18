import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "../../../app.js"

describe("Integração - API de saúde", () => {
  test("GET /api/saude deve retornar status 200", async () => {
    const resposta = await request(app)
      .get("/api/saude");

    expect(resposta.status).toBe(200);

    expect(resposta.body).toEqual({
      status: "ok",
      servico: "JES 2026 API",
    });
  });
});