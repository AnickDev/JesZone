import "dotenv/config";
import { sequelize, Turma, SerieSelecao } from "../models/index.js";

const SERIES = [
  { serie: "6EF", rotulo: "6º Ano", categoria: "Fundamental", pais: "br" },
  { serie: "7EF", rotulo: "7º Ano", categoria: "Fundamental", pais: "ar" },
  { serie: "8EF", rotulo: "8º Ano", categoria: "Fundamental", pais: "de" },
  { serie: "9EF", rotulo: "9º Ano", categoria: "Fundamental", pais: "it" },
  { serie: "1EM", rotulo: "1º EM", categoria: "Medio", pais: "fr" },
  { serie: "2EM", rotulo: "2º EM", categoria: "Medio", pais: "es" },
  { serie: "3EM", rotulo: "3º EM", categoria: "Medio", pais: "eng" },
];

const LETRAS = ["A", "B", "C", "D"];

async function semear() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const s of SERIES) {
    await SerieSelecao.findOrCreate({
      where: { serie: s.serie },
      defaults: { paisKey: s.pais },
    });
  }

  for (const s of SERIES) {
    for (const letra of LETRAS) {
      await Turma.findOrCreate({
        where: { id: `${s.serie}-${letra}` },
        defaults: {
          id: `${s.serie}-${letra}`,
          nome: `${s.rotulo} ${letra}`,
          serie: s.serie,
          letra,
          categoria: s.categoria,
          paisKey: s.pais,
        },
      });
    }
  }

  console.log("Dados iniciais (séries e turmas) verificados/criados com sucesso.");
  await sequelize.close();
}

semear().catch((erro) => {
  console.error("Falha ao semear o banco:", erro);
  process.exit(1);
});
