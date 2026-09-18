import "dotenv/config"
import { Sequelize } from "sequelize";

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "mysql",
  logging: NODE_ENV === "development" ? false : false,
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Cria o banco (`DB_NAME`) caso ele ainda não exista. Sem isso, quem baixa o
 * projeto em outra máquina precisaria rodar um `CREATE DATABASE` na mão antes
 * de subir o servidor — o Sequelize cria as tabelas, mas nunca o banco.
 * A conexão aqui é feita sem selecionar um banco, justamente porque ele pode
 * ainda não existir.
 */
async function garantirBancoExiste() {
  const admin = new Sequelize("", DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: "mysql",
    logging: false,
  });
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
  } finally {
    await admin.close();
  }
}

export async function conectarBanco() {
  await garantirBancoExiste();
  await sequelize.authenticate();
}

export default sequelize;
