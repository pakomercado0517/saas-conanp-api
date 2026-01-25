import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { Actividad } from './actividad.model';

export interface BloqueAttributes {
  id: UUID;
  organizationId: UUID;
  actividadId: UUID;
  date: string | null; // DATEONLY se representa como string en formato YYYY-MM-DD
  startTime: string; // TIME se representa como string en formato HH:mm:ss
  endTime: string; // TIME se representa como string en formato HH:mm:ss
  capacity: number;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BloqueCreationAttributes
  extends Optional<BloqueAttributes, 'id' | 'date' | 'capacity' | 'isTemplate' | 'createdAt' | 'updatedAt'> {}

export class Bloque
  extends Model<BloqueAttributes, BloqueCreationAttributes>
  implements BloqueAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare actividadId: UUID;
  declare date: string | null;
  declare startTime: string;
  declare endTime: string;
  declare capacity: number;
  declare isTemplate: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare Organization?: Organization;
  declare Actividad?: Actividad;
}

Bloque.init(
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
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La hora de inicio es requerida',
        },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La hora de fin es requerida',
        },
        isAfterStartTime(value: string): void {
          if (this['startTime'] && value <= this['startTime']) {
            throw new Error('La hora de fin debe ser posterior a la hora de inicio');
          }
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'La capacidad debe ser al menos 1',
        },
        isInt: {
          msg: 'La capacidad debe ser un número entero',
        },
      },
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'Bloque',
    tableName: 'bloques',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_bloques_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_bloques_actividad',
        fields: ['actividadId'],
      },
      {
        name: 'idx_bloques_actividad_date',
        fields: ['actividadId', 'date'],
      },
      {
        name: 'idx_bloques_date',
        fields: ['date'],
      },
      {
        name: 'idx_bloques_is_template',
        fields: ['isTemplate'],
      },
    ],
  }
);

// Definir relaciones
Bloque.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Bloque.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });

Organization.hasMany(Bloque, { foreignKey: 'organizationId', as: 'Bloques' });
Actividad.hasMany(Bloque, { foreignKey: 'actividadId', as: 'Bloques' });
