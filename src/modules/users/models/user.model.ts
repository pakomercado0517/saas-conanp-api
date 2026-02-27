import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';

export interface UserAttributes {
  id: UUID;
  email: string;
  password: string;
  name: string;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpiresAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiresAt: Date | null;
  onboardingStatus: 'pending_setup' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  | 'id'
  | 'emailVerified'
  | 'emailVerificationToken'
  | 'emailVerificationExpiresAt'
  | 'passwordResetToken'
  | 'passwordResetExpiresAt'
  | 'onboardingStatus'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: UUID;
  declare email: string;
  declare password: string;
  declare name: string;
  declare emailVerified: boolean;
  declare emailVerificationToken: string | null;
  declare emailVerificationExpiresAt: Date | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpiresAt: Date | null;
  declare onboardingStatus: 'pending_setup' | 'completed';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'El email debe tener un formato válido',
        },
        notEmpty: {
          msg: 'El email es requerido',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña es requerida',
        },
        len: {
          args: [8, 255],
          msg: 'La contraseña debe tener al menos 8 caracteres',
        },
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre es requerido',
        },
        len: {
          args: [1, 255],
          msg: 'El nombre debe tener entre 1 y 255 caracteres',
        },
      },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailVerificationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    onboardingStatus: {
      type: DataTypes.ENUM('pending_setup', 'completed'),
      allowNull: false,
      defaultValue: 'completed',
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_users_email_unique',
        unique: true,
        fields: ['email'],
      },
    ],
  }
);
