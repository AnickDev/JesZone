import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Textos do regulamento do JES, organizados por chave (seção).
 */
export class Regulamento extends Model {}

Regulamento.init(
  {
    chave: {
      type: DataTypes.STRING(40),
      primaryKey: true,
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    sequelize,
    modelName: "Regulamento",
    tableName: "regulamento",
    timestamps: true,
    createdAt: false,
    updatedAt: "atualizado_em",
  },
);

export default Regulamento;
