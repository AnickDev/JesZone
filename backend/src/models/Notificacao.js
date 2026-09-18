import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/banco.js";

/**
 * Histórico permanente de notificações publicadas (avisos, resultados, etc.).
 */
export class Notificacao extends Model {}

Notificacao.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM(
        "jogo-iniciado",
        "resultado",
        "campeao",
        "agenda",
        "cancelado",
        "aviso",
        "sos",
      ),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(160),
      allowNull: false,
      validate: { len: [1, 160] },
    },
    descricao: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
    escopo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "todos",
    },
    // Campos exclusivos do aviso de SOS/emergência (tipo === "sos").
    sosLocal: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: "sos_local",
    },
    sosNecessidade: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: "sos_necessidade",
    },
    sosUrgencia: {
      type: DataTypes.ENUM("baixa", "media", "alta", "critica"),
      allowNull: true,
      field: "sos_urgencia",
    },
    autorId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "autor_id",
    },
    autorEmail: {
      type: DataTypes.STRING(140),
      allowNull: true,
      field: "autor_email",
    },
  },
  {
    sequelize,
    modelName: "Notificacao",
    tableName: "notificacoes",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: false,
    indexes: [{ fields: ["criado_em"] }],
  },
);

export default Notificacao;
