import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';

export interface DependenciaAttributes {
  id: UUID;
  name: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DependenciaCreationAttributes extends Optional<
  DependenciaAttributes,
  'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}

export class Dependencia
  extends Model<DependenciaAttributes, DependenciaCreationAttributes>
  implements DependenciaAttributes
{
  declare id: UUID;
  declare name: string;
  declare settings: Record<string, unknown>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;
}

Dependencia.init(
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
        notEmpty: { msg: 'El nombre de la dependencia es requerido' },
        len: { args: [1, 255], msg: 'El nombre debe tener entre 1 y 255 caracteres' },
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Dependencia',
    tableName: 'dependencias',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [{ name: 'idx_dependencias_name', fields: ['name'] }],
  }
);
