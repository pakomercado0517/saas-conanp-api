import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, Role } from '@/shared/database/types';
import { Area } from '@/modules/areas/models/area.model.js';
import { User } from './user.model.js';

export interface MembershipAttributes {
  id: UUID;
  userId: UUID;
  areaId: UUID;
  role: Role;
  status: 'activo' | 'inactivo' | 'suspendido';
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipCreationAttributes extends Optional<
  MembershipAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt'
> {}

export class Membership
  extends Model<MembershipAttributes, MembershipCreationAttributes>
  implements MembershipAttributes
{
  declare id: UUID;
  declare userId: UUID;
  declare areaId: UUID;
  declare role: Role;
  declare status: 'activo' | 'inactivo' | 'suspendido';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare User?: User;
  declare Area?: Area;
}

Membership.init(
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
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    areaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'areas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    role: {
      type: DataTypes.ENUM('admin', 'gestor', 'prestador', 'observador'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['admin', 'gestor', 'prestador', 'observador']],
          msg: 'El rol debe ser: admin, gestor, prestador u observador',
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
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: true,
    underscored: false,
    indexes: [
      { name: 'idx_memberships_user_area', unique: true, fields: ['userId', 'areaId'] },
      { name: 'idx_memberships_area', fields: ['areaId'] },
      { name: 'idx_memberships_user', fields: ['userId'] },
      { name: 'idx_memberships_role', fields: ['role'] },
      { name: 'idx_memberships_status', fields: ['status'] },
    ],
  }
);

Membership.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Membership.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
User.hasMany(Membership, { foreignKey: 'userId', as: 'Memberships' });
Area.hasMany(Membership, { foreignKey: 'areaId', as: 'Memberships' });
