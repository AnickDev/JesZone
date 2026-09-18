import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Mapeia cada série escolar (ex.: "6EF") à seleção/país que ela representa.
 */
export class SerieSelecao extends Model {}

SerieSelecao.init(
  {
    serie: {
      type: DataTypes.STRING(8),
      primaryKey: true,
    },
    paisKey: {
      type: DataTypes.STRING(6),
      allowNull: false,
      field: "pais_key",
    },
  },
  {
    sequelize,
    modelName: "SerieSelecao",
    tableName: "serie_selecao",
    timestamps: false,
  },
);

export default SerieSelecao;
