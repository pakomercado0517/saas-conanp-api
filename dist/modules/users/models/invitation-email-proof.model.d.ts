import { Model, type Optional } from 'sequelize';
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
export interface InvitationEmailProofCreationAttributes extends Optional<InvitationEmailProofAttributes, 'id' | 'attempts' | 'proofTokenHash' | 'proofExpiresAt' | 'usedAt' | 'createdAt' | 'updatedAt'> {
}
export declare class InvitationEmailProof extends Model<InvitationEmailProofAttributes, InvitationEmailProofCreationAttributes> implements InvitationEmailProofAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Invitation?: Invitation;
}
//# sourceMappingURL=invitation-email-proof.model.d.ts.map