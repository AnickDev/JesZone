import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Pódio (campeã/vice/terceira) de modalidades sem confronto direto
 * (ex.: Xadrez, Dama, Atletismo).
 */
export class ResultadoUnico extends Model {}

ResultadoUnico.init(
  {
    modalidadeSlug: {
      type: DataTypes.STRING(40),
      primaryKey: true,
      field: "modalidade_slug",
    },
    categoria: {
      type: DataTypes.ENUM("Fundamental", "Medio"),
      primaryKey: true,
    },
    campeaoTurmaId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "campeao_turma_id",
    },
    viceTurmaId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "vice_turma_id",
    },
    terceiroTurmaId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "terceiro_turma_id",
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ResultadoUnico",
    tableName: "resultados_unicos",
    timestamps: true,
    createdAt: false,
    updatedAt: "atualizado_em",
  },
);

export default ResultadoUnico;
