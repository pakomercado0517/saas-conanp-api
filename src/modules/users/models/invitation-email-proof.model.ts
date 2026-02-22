import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Invitation } from './invitation.model';

export interface InvitationEmailProofAttributes {
  id: UUID;
  invitationId: UUID;
  email: string;
  otpHash: string;
  attempts: number;
  maxAttempts: number;
  otpExpiresAt: Date;
  proofTokenHash: string | null;
  proofExpiresAt: Date | null;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationEmailProofCreationAttributes extends Optional<
  InvitationEmailProofAttributes,
  'id' | 'attempts' | 'proofTokenHash' | 'proofExpiresAt' | 'usedAt' | 'createdAt' | 'updatedAt'
> {}

export class InvitationEmailProof
  extends Model<InvitationEmailProofAttributes, InvitationEmailProofCreationAttributes>
  implements InvitationEmailProofAttributes
{
  declare id: UUID;
  declare invitationId: UUID;
  declare email: string;
  declare otpHash: string;
  declare attempts: number;
  declare maxAttempts: number;
  declare otpExpiresAt: Date;
  declare proofTokenHash: string | null;
  declare proofExpiresAt: Date | null;
  declare usedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Invitation?: Invitation;
}

InvitationEmailProof.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    invitationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'invitations', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otpHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    proofTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    proofExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'invitation_email_proofs',
    modelName: 'InvitationEmailProof',
    timestamps: true,
    indexes: [
      { name: 'idx_invitation_email_proofs_invitation_email', fields: ['invitationId', 'email'] },
      { name: 'idx_invitation_email_proofs_proof_token', fields: ['proofTokenHash'] },
      { name: 'idx_invitation_email_proofs_otp_expires', fields: ['otpExpiresAt'] },
    ],
  }
);

InvitationEmailProof.belongsTo(Invitation, { foreignKey: 'invitationId', as: 'Invitation' });
