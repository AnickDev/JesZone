import "dotenv/config"
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../../app.js"
import { popularTabela } from "../../utils/popularTurmas.js"
import { Turma } from "../../models/index.js"

const email = "suporte.admjeszone@sesi.senai.com.br"
const senha = "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f"

beforeAll(async () => {
    await popularTabela()
})

describe("TURMA ROTAS", async () => {
    const login = await request(app)
        .post("/api/auth/entrar")
        .send({
            email: "suporte.admjeszone@sesi.senai.com.br",
            senha: "0e1e6c5d1e2e7c1c6e9e9d5e0e7b6a5f"
        });
    const token = login.body.token
    const turma = await Turma.findOne()
    test("Salva turma", async () => {
        const response = await request(app)
            .put(`/api/turmas/${turma.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Turma A",
                serie: "1A",
                letra: "A",
                categoria: "Fundamental",
                paisKey: "br"
            })

            console.log(turma.id)
       
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("ok")
    })
    test("Exclui turma", async () => {
        const response = await request(app)
            .delete(`/api/turmas/${turma.id}`)
            .set("Authorization", `Bearer ${token}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("ok")
    })
})
