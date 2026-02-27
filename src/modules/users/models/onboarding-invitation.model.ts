import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { User } from './user.model.js';

export type OnboardingInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface OnboardingInvitationAttributes {
  id: UUID;
  email: string;
  tokenHash: string;
  invitedBy: UUID;
  status: OnboardingInvitationStatus;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingInvitationCreationAttributes
  extends Optional<
    OnboardingInvitationAttributes,
    'id' | 'status' | 'usedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'
  > {}

export class OnboardingInvitation
  extends Model<OnboardingInvitationAttributes, OnboardingInvitationCreationAttributes>
  implements OnboardingInvitationAttributes
{
  declare id: UUID;
  declare email: string;
  declare tokenHash: string;
  declare invitedBy: UUID;
  declare status: OnboardingInvitationStatus;
  declare expiresAt: Date;
  declare usedAt: Date | null;
  declare revokedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare InvitedByUser?: User;
}

OnboardingInvitation.init(
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
      validate: {
        notEmpty: { msg: 'El email del invitado es requerido' },
        isEmail: { msg: 'El email debe ser válido' },
      },
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El token es requerido' },
      },
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notEmpty: { msg: 'El ID del invitador es requerido' },
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired', 'revoked'),
      allowNull: false,
      defaultValue: 'pending',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'expiresAt debe ser una fecha válida', args: true },
      },
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'OnboardingInvitation',
    tableName: 'onboarding_invitations',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_onboarding_invitations_token_hash',
        unique: true,
        fields: ['tokenHash'],
      },
      {
        name: 'idx_onboarding_invitations_email_status',
        fields: ['email', 'status'],
      },
      {
        name: 'idx_onboarding_invitations_expires_at',
        fields: ['expiresAt'],
      },
    ],
  }
);

OnboardingInvitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'InvitedByUser' });
User.hasMany(OnboardingInvitation, { foreignKey: 'invitedBy', as: 'OnboardingInvitationsSent' });

