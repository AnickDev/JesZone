import { describe, expect, test } from "vitest";
import { conectarBanco,  sequelize} from "../../config/banco.js";

describe("Integração - Banco de dados", () => {
  test("deve conseguir conectar ao MySQL", async () => {
    await conectarBanco();

    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });
});