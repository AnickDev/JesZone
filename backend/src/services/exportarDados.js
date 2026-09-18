/**
 * Exporta TODOS os dados atuais do MySQL para o arquivo
 * `backend/dados/dados-jes.json`, que é versionado junto com o projeto.
 *
 * Uso: npm run dados:exportar
 *
 * Rode isso no SEU computador, depois de já ter importado as planilhas e
 * cadastrado tudo pelo painel. O arquivo gerado vai junto no ZIP, e quem
 * receber o projeto sobe o servidor e os dados aparecem automaticamente.
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { sequelize } from "../models/index.js";
import { ARQUIVO_DADOS, TABELAS, normalizarRegistro } from "./dadosSnapshot.js";

async function exportar() {
  await sequelize.authenticate();
  await sequelize.sync();

  const snapshot = {
    geradoEm: new Date().toISOString(),
    versao: 1,
    dados: {},
  };

  for (const { chave, model } of TABELAS) {
    const registros = (await model.findAll({ raw: true })).map((r) =>
      normalizarRegistro(model, r),
    );
    snapshot.dados[chave] = registros;
    console.log(`  ${chave}: ${registros.length} registro(s)`);
  }

  await fs.mkdir(path.dirname(ARQUIVO_DADOS), { recursive: true });
  await fs.writeFile(ARQUIVO_DADOS, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`\nDados exportados para: ${ARQUIVO_DADOS}`);
  console.log("Inclua esse arquivo no ZIP que você enviar.");
  await sequelize.close();
}

exportar().catch((erro) => {
  console.error("Falha ao exportar os dados:", erro);
  process.exit(1);
});
