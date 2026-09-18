import { sequelize } from "../config/banco.js";
import { Turma } from "./Turma.js";
import { Jogo } from "./Jogo.js";
import { SerieSelecao } from "./SerieSelecao.js";
import { Regulamento } from "./Regulamento.js";
import { ResultadoUnico } from "./ResultadoUnico.js";
import { Notificacao } from "./Notificacao.js";

// Jogo.turma_a / Jogo.turma_b -> turmas.id (ON DELETE CASCADE, como no schema original)
Jogo.belongsTo(Turma, {
  as: "dadosTurmaA",
  foreignKey: "turmaA",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Jogo.belongsTo(Turma, {
  as: "dadosTurmaB",
  foreignKey: "turmaB",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Turma.hasMany(Jogo, { as: "jogosComoA", foreignKey: "turmaA" });
Turma.hasMany(Jogo, { as: "jogosComoB", foreignKey: "turmaB" });

// resultados_unicos.campeao/vice/terceiro_turma_id -> turmas.id
ResultadoUnico.belongsTo(Turma, {
  as: "campeaTurma",
  foreignKey: "campeaoTurmaId",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ResultadoUnico.belongsTo(Turma, {
  as: "viceTurma",
  foreignKey: "viceTurmaId",
  targetKey: "id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ResultadoUnico.belongsTo(Turma, {
  as: "terceiraTurma",
  foreignKey: "terceiroTurmaId",
  targetKey: "id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export { sequelize, Turma, Jogo, SerieSelecao, Regulamento, ResultadoUnico, Notificacao };

export default {
  sequelize,
  Turma,
  Jogo,
  SerieSelecao,
  Regulamento,
  ResultadoUnico,
  Notificacao,
};

