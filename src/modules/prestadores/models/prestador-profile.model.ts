import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { User } from '@/modules/users/models/user.model';

export interface PrestadorProfileAttributes {
  id: UUID;
  userId: UUID;
  organizationId: UUID;
  status: 'activo' | 'inactivo' | 'suspendido';
  permitExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrestadorProfileCreationAttributes
  extends Optional<PrestadorProfileAttributes, 'id' | 'status' | 'permitExpiresAt' | 'createdAt' | 'updatedAt'> {}

export class PrestadorProfile
  extends Model<PrestadorProfileAttributes, PrestadorProfileCreationAttributes>
  implements PrestadorProfileAttributes
{
  declare id: UUID;
  declare userId: UUID;
  declare organizationId: UUID;
  declare status: 'activo' | 'inactivo' | 'suspendido';
  declare permitExpiresAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare User?: User;
  declare Organization?: Organization;
}

PrestadorProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID de usuario es requerido',
        },
      },
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
    status: {
      type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
      allowNull: false,
      defaultValue: 'activo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'suspendido']],
          msg: 'El estado debe ser: activo, inactivo o suspendido',
        },
      },
    },
    permitExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
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
    modelName: 'PrestadorProfile',
    tableName: 'prestador_profiles',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_prestador_profiles_user_org',
        unique: true,
        fields: ['userId', 'organizationId'],
      },
      {
        name: 'idx_prestador_profiles_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_prestador_profiles_user',
        fields: ['userId'],
      },
      {
        name: 'idx_prestador_profiles_status',
        fields: ['status'],
      },
      {
        name: 'idx_prestador_profiles_permit_expires',
        fields: ['permitExpiresAt'],
      },
    ],
  }
);

// Definir relaciones
PrestadorProfile.belongsTo(User, { foreignKey: 'userId', as: 'User' });
PrestadorProfile.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });

User.hasMany(PrestadorProfile, { foreignKey: 'userId', as: 'PrestadorProfiles' });
Organization.hasMany(PrestadorProfile, { foreignKey: 'organizationId', as: 'PrestadorProfiles' });
