/**
 * Importa os dados do arquivo `backend/dados/dados-jes.json` para o MySQL.
 *
 * É chamado de dois jeitos:
 *  - automaticamente na subida do servidor, quando o banco está vazio
 *    (é isso que faz "baixar e já estar com os dados" funcionar);
 *  - manualmente, via `npm run dados:importar` (com `--forcar` para
 *    sobrescrever dados existentes).
 */
import fs from "node:fs/promises";
import { sequelize } from "../models/index.js";
import { ARQUIVO_DADOS, TABELAS, normalizarRegistro } from "./dadosSnapshot.js";

async function lerSnapshot() {
  try {
    const bruto = await fs.readFile(ARQUIVO_DADOS, "utf8");
    return JSON.parse(bruto);
  } catch (erro) {
    if (erro.code === "ENOENT") return null; // projeto sem snapshot: segue vazio
    throw new Error(`Arquivo de dados inválido (${ARQUIVO_DADOS}): ${erro.message}`);
  }
}

/** True quando ainda não há nenhuma turma cadastrada (banco "novo"). */
export async function bancoVazio() {
  const { Turma } = await import("../models/index.js");
  return (await Turma.count()) === 0;
}

/**
 * Grava o snapshot no banco. Usa upsert, então rodar duas vezes não duplica
 * nada: registros existentes são atualizados e os novos, inseridos.
 */
export async function importarDados({ silencioso = false } = {}) {
  const snapshot = await lerSnapshot();
  if (!snapshot?.dados) {
    if (!silencioso) console.log("Nenhum arquivo de dados encontrado — nada a importar.");
    return { importado: false, totais: {} };
  }

  const totais = {};
  for (const { chave, model } of TABELAS) {
    const registros = snapshot.dados[chave] ?? [];
    for (const registro of registros) {
      await model.upsert(normalizarRegistro(model, registro));
    }
    totais[chave] = registros.length;
    if (!silencioso) console.log(`  ${chave}: ${registros.length} registro(s)`);
  }

  return { importado: true, totais, geradoEm: snapshot.geradoEm };
}

/**
 * Chamado na subida do servidor. Só importa se o banco estiver vazio, para
 * nunca sobrescrever dados que o usuário já cadastrou por conta própria.
 */
export async function importarSeBancoVazio() {
  if (!(await bancoVazio())) return false;
  const { importado, geradoEm } = await importarDados({ silencioso: true });
  if (importado) {
    console.log(
      `Banco vazio: dados iniciais importados de dados/dados-jes.json (snapshot de ${geradoEm ?? "data desconhecida"}).`,
    );
  }
  return importado;
}

// Execução direta pela linha de comando: npm run dados:importar [-- --forcar]
const executadoDiretamente = process.argv[1]?.includes("importarDados");
if (executadoDiretamente) {
  const forcar = process.argv.includes("--forcar");
  const { default: dotenv } = await import("dotenv");
  dotenv.config();

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    if (!forcar && !(await bancoVazio())) {
      console.log(
        "O banco já possui turmas cadastradas. Nada foi alterado.\n" +
          "Para sobrescrever mesmo assim, rode: npm run dados:importar -- --forcar",
      );
    } else {
      await importarDados();
      console.log("\nDados importados com sucesso.");
    }
    await sequelize.close();
  } catch (erro) {
    console.error("Falha ao importar os dados:", erro);
    process.exit(1);
  }
}
