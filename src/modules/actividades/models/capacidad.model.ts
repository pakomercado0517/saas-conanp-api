import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { Actividad } from './actividad.model';

export interface CapacidadAttributes {
  id: UUID;
  organizationId: UUID;
  actividadId: UUID;
  date: string; // DATEONLY se representa como string en formato YYYY-MM-DD
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapacidadCreationAttributes
  extends Optional<CapacidadAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Capacidad
  extends Model<CapacidadAttributes, CapacidadCreationAttributes>
  implements CapacidadAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare actividadId: UUID;
  declare date: string;
  declare limit: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare Organization?: Organization;
  declare Actividad?: Actividad;
}

Capacidad.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID de organización es requerido',
        },
      },
    },
    actividadId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'actividades',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID de actividad es requerido',
        },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'El límite debe ser al menos 1',
        },
        isInt: {
          msg: 'El límite debe ser un número entero',
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
    modelName: 'Capacidad',
    tableName: 'capacidades',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_capacidades_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_capacidades_actividad',
        fields: ['actividadId'],
      },
      {
        name: 'idx_capacidades_actividad_date',
        unique: true,
        fields: ['actividadId', 'date'],
      },
      {
        name: 'idx_capacidades_date',
        fields: ['date'],
      },
    ],
  }
);

// Definir relaciones
Capacidad.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Capacidad.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });

Organization.hasMany(Capacidad, { foreignKey: 'organizationId', as: 'Capacidades' });
Actividad.hasMany(Capacidad, { foreignKey: 'actividadId', as: 'Capacidades' });
