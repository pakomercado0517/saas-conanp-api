import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database/index.js';
import type { UUID } from '@/shared/database/types.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Actividad } from './actividad.model.js';

export interface CapacidadAttributes {
  id: UUID;
  areaId: UUID;
  actividadId: UUID;
  date: string;
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapacidadCreationAttributes extends Optional<
  CapacidadAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

export class Capacidad
  extends Model<CapacidadAttributes, CapacidadCreationAttributes>
  implements CapacidadAttributes
{
  declare id: UUID;
  declare areaId: UUID;
  declare actividadId: UUID;
  declare date: string;
  declare limit: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Area?: Area;
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
    areaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'areas',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID de área es requerido',
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
        name: 'idx_capacidades_area',
        fields: ['areaId'],
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

Capacidad.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
Capacidad.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });

Area.hasMany(Capacidad, { foreignKey: 'areaId', as: 'Capacidades' });
Actividad.hasMany(Capacidad, { foreignKey: 'actividadId', as: 'Capacidades' });
