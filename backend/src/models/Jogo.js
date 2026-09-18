import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Representa um jogo/confronto entre duas turmas em uma modalidade.
 */
export class Jogo extends Model {}

Jogo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    modalidadeSlug: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "modalidade_slug",
    },
    categoria: {
      type: DataTypes.ENUM("Fundamental", "Medio"),
      allowNull: false,
    },
    turmaA: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "turma_a",
    },
    turmaB: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "turma_b",
    },
    placarA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "placar_a",
      validate: { min: 0 },
    },
    placarB: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "placar_b",
      validate: { min: 0 },
    },
    setsA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "sets_a",
    },
    setsB: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "sets_b",
    },
    status: {
      type: DataTypes.ENUM("agendado", "ao-vivo", "encerrado"),
      allowNull: false,
      defaultValue: "agendado",
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    local: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "Quadra de Vôlei 1",
    },
    wo: {
      type: DataTypes.ENUM("A", "B"),
      allowNull: true,
    },
    fase: {
      type: DataTypes.ENUM("grupos", "oitavas", "quartas", "semi", "final", "terceiro"),
      allowNull: false,
      defaultValue: "grupos",
    },
    grupo: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Jogo",
    tableName: "jogos",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: "atualizado_em",
    indexes: [
      { fields: ["modalidade_slug", "categoria"] },
      { fields: ["status"] },
      { fields: ["turma_a"] },
      { fields: ["turma_b"] },
    ],
  },
);

export default Jogo;
