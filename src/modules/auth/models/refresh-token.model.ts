import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';

export interface RefreshTokenAttributes {
  id: UUID;
  userId: UUID;
  token: string; // Token hasheado
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenCreationAttributes extends Optional<
  RefreshTokenAttributes,
  'id' | 'revokedAt' | 'createdAt' | 'updatedAt'
> {}

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare id: UUID;
  declare userId: UUID;
  declare token: string;
  declare expiresAt: Date;
  declare revokedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RefreshToken.init(
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'Usuario propietario del token',
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'Token de refresh hasheado con bcrypt',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha de expiración del token',
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Fecha de revocación del token (null si está activo)',
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
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_refresh_tokens_user_id',
        fields: ['userId'],
      },
      {
        name: 'idx_refresh_tokens_token_unique',
        unique: true,
        fields: ['token'],
      },
      {
        name: 'idx_refresh_tokens_expires_at',
        fields: ['expiresAt'],
      },
      {
        name: 'idx_refresh_tokens_user_expires',
        fields: ['userId', 'expiresAt'],
      },
    ],
  }
);
