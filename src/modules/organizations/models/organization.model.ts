import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, EcosystemType } from '@/shared/database/types';

export interface OrganizationAttributes {
  id: UUID;
  name: string;
  ecosystem_type: EcosystemType;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationCreationAttributes extends Optional<
  OrganizationAttributes,
  'id' | 'settings' | 'createdAt' | 'updatedAt'
> {}

export class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  declare id: UUID;
  declare name: string;
  declare ecosystem_type: EcosystemType;
  declare settings: Record<string, unknown>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la organización es requerido',
        },
        len: {
          args: [1, 255],
          msg: 'El nombre debe tener entre 1 y 255 caracteres',
        },
      },
    },
    ecosystem_type: {
      type: DataTypes.ENUM('terrestre', 'maritimo', 'mixto'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['terrestre', 'maritimo', 'mixto']],
          msg: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
        },
      },
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isObject(value: unknown): void {
          if (value !== null && typeof value !== 'object') {
            throw new Error('Settings debe ser un objeto');
          }
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
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_organizations_name',
        fields: ['name'],
      },
      {
        name: 'idx_organizations_ecosystem_type',
        fields: ['ecosystem_type'],
      },
    ],
  }
);
