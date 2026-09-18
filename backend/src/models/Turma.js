import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Representa uma turma da escola (ex.: "6EF-A") e sua seleção/país vinculado.
 */
export class Turma extends Model {}

Turma.init(
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    serie: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    letra: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.ENUM("Fundamental", "Medio"),
      allowNull: false,
    },
    paisKey: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: "br",
      field: "pais_key",
    },
    juncaoCom: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "juncao_com",
    },
    juncaoMotivo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "juncao_motivo",
    },
    // Lista de ids de turmas reais que compõem esta "turma" quando ela é, na
    // verdade, uma união de várias turmas jogando juntas em uma modalidade
    // (ex.: "7ºA/B/C"). Preenchido automaticamente pela importação de
    // planilhas/documentos de chaveamento. Nulo para turmas normais.
    membros: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "Turma",
    tableName: "turmas",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: false,
  },
);

export default Turma;
