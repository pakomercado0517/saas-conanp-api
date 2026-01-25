import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, ActivoType } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model';

export interface ActivoAttributes {
  id: UUID;
  organizationId: UUID;
  ownerId: UUID;
  type: ActivoType;
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivoCreationAttributes extends Optional<
  ActivoAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt'
> {}

export class Activo
  extends Model<ActivoAttributes, ActivoCreationAttributes>
  implements ActivoAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare ownerId: UUID;
  declare type: ActivoType;
  declare status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare Organization?: Organization;
  declare Owner?: PrestadorProfile;
}

Activo.init(
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
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'prestador_profiles',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID del propietario es requerido',
        },
      },
    },
    type: {
      type: DataTypes.ENUM('embarcacion', 'vehiculo', 'guia', 'equipo'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['embarcacion', 'vehiculo', 'guia', 'equipo']],
          msg: 'El tipo debe ser: embarcacion, vehiculo, guia o equipo',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido'),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['pendiente', 'aprobado', 'rechazado', 'suspendido']],
          msg: 'El estado debe ser: pendiente, aprobado, rechazado o suspendido',
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
    modelName: 'Activo',
    tableName: 'activos',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_activos_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_activos_owner',
        fields: ['ownerId'],
      },
      {
        name: 'idx_activos_org_owner',
        fields: ['organizationId', 'ownerId'],
      },
      {
        name: 'idx_activos_type',
        fields: ['type'],
      },
      {
        name: 'idx_activos_status',
        fields: ['status'],
      },
      {
        name: 'idx_activos_org_status',
        fields: ['organizationId', 'status'],
      },
    ],
  }
);

// Definir relaciones
Activo.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Activo.belongsTo(PrestadorProfile, { foreignKey: 'ownerId', as: 'Owner' });

Organization.hasMany(Activo, { foreignKey: 'organizationId', as: 'Activos' });
PrestadorProfile.hasMany(Activo, { foreignKey: 'ownerId', as: 'Activos' });
