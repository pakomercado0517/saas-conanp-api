import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, Role } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { User } from './user.model';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface InvitationAttributes {
  id: UUID;
  organizationId: UUID;
  email: string;
  role: Role;
  tokenHash: string;
  invitedBy: UUID;
  status: InvitationStatus;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationCreationAttributes extends Optional<
  InvitationAttributes,
  'id' | 'status' | 'usedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'
> {}

export class Invitation
  extends Model<InvitationAttributes, InvitationCreationAttributes>
  implements InvitationAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare email: string;
  declare role: Role;
  declare tokenHash: string;
  declare invitedBy: UUID;
  declare status: InvitationStatus;
  declare expiresAt: Date;
  declare usedAt: Date | null;
  declare revokedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Organization?: Organization;
  declare InvitedByUser?: User;
}

Invitation.init(
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
        notEmpty: { msg: 'El ID de organización es requerido' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El email del invitado es requerido' },
        isEmail: { msg: 'El email debe ser válido' },
      },
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
      validate: {
        notEmpty: { msg: 'El ID del invitador es requerido' },
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired', 'revoked'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'accepted', 'expired', 'revoked']],
          msg: 'El estado debe ser: pending, accepted, expired o revoked',
        },
      },
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
    modelName: 'Invitation',
    tableName: 'invitations',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_invitations_token_hash',
        unique: true,
        fields: ['tokenHash'],
      },
      {
        name: 'idx_invitations_org_email_status',
        fields: ['organizationId', 'email', 'status'],
      },
      {
        name: 'idx_invitations_expires_at',
        fields: ['expiresAt'],
      },
      {
        name: 'idx_invitations_organization',
        fields: ['organizationId'],
      },
      {
        name: 'idx_invitations_email',
        fields: ['email'],
      },
    ],
  }
);

Invitation.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Invitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'InvitedByUser' });

Organization.hasMany(Invitation, { foreignKey: 'organizationId', as: 'Invitations' });
User.hasMany(Invitation, { foreignKey: 'invitedBy', as: 'InvitationsSent' });
