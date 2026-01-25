import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model';

export interface EvidenciaAmbientalAttributes {
  id: UUID;
  eventoId: UUID;
  type: string;
  description: string | null;
  fileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenciaAmbientalCreationAttributes extends Optional<
  EvidenciaAmbientalAttributes,
  'id' | 'description' | 'fileUrl' | 'createdAt' | 'updatedAt'
> {}

export class EvidenciaAmbiental
  extends Model<EvidenciaAmbientalAttributes, EvidenciaAmbientalCreationAttributes>
  implements EvidenciaAmbientalAttributes
{
  declare id: UUID;
  declare eventoId: UUID;
  declare type: string;
  declare description: string | null;
  declare fileUrl: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare EventoOperativo?: EventoOperativo;
}

EvidenciaAmbiental.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    eventoId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'eventos_operativos',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID de evento es requerido',
        },
      },
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El tipo de evidencia es requerido',
        },
        len: {
          args: [1, 100],
          msg: 'El tipo debe tener entre 1 y 100 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isURL: {
          protocols: ['http', 'https'],
          require_protocol: true,
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'EvidenciaAmbiental',
    tableName: 'evidencias_ambientales',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_evidencias_ambientales_evento',
        fields: ['eventoId'],
      },
      {
        name: 'idx_evidencias_ambientales_type',
        fields: ['type'],
      },
    ],
  }
);

// Definir relaciones
EvidenciaAmbiental.belongsTo(EventoOperativo, { foreignKey: 'eventoId', as: 'EventoOperativo' });
EventoOperativo.hasMany(EvidenciaAmbiental, {
  foreignKey: 'eventoId',
  as: 'EvidenciasAmbientales',
});
