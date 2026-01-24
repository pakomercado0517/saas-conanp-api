import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, ActividadType, AgendaType } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';

export interface ActividadAttributes {
  id: UUID;
  organizationId: UUID;
  name: string;
  type: ActividadType;
  agendaType: AgendaType;
  requiresGuide: boolean;
  impactLevel: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActividadCreationAttributes
  extends Optional<ActividadAttributes, 'id' | 'requiresGuide' | 'impactLevel' | 'active' | 'createdAt' | 'updatedAt'> {}

export class Actividad
  extends Model<ActividadAttributes, ActividadCreationAttributes>
  implements ActividadAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare name: string;
  declare type: ActividadType;
  declare agendaType: AgendaType;
  declare requiresGuide: boolean;
  declare impactLevel: string | null;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare Organization?: Organization;
}

Actividad.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la actividad es requerido',
        },
        len: {
          args: [1, 255],
          msg: 'El nombre debe tener entre 1 y 255 caracteres',
        },
      },
    },
    type: {
      type: DataTypes.ENUM('terrestre', 'maritima', 'mixta'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['terrestre', 'maritima', 'mixta']],
          msg: 'El tipo debe ser: terrestre, maritima o mixta',
        },
      },
    },
    agendaType: {
      type: DataTypes.ENUM('BLOQUES', 'HORARIO_LIBRE'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['BLOQUES', 'HORARIO_LIBRE']],
          msg: 'El tipo de agenda debe ser: BLOQUES o HORARIO_LIBRE',
        },
      },
    },
    requiresGuide: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    impactLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'El nivel de impacto no puede exceder 50 caracteres',
        },
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'Actividad',
    tableName: 'actividades',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_actividades_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_actividades_org_active',
        fields: ['organizationId', 'active'],
      },
      {
        name: 'idx_actividades_type',
        fields: ['type'],
      },
      {
        name: 'idx_actividades_agenda_type',
        fields: ['agendaType'],
      },
    ],
  }
);

// Definir relaciones
Actividad.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Organization.hasMany(Actividad, { foreignKey: 'organizationId', as: 'Actividades' });
