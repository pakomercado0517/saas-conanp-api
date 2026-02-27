import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
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
export interface OnboardingInvitationCreationAttributes extends Optional<OnboardingInvitationAttributes, 'id' | 'status' | 'usedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'> {
}
export declare class OnboardingInvitation extends Model<OnboardingInvitationAttributes, OnboardingInvitationCreationAttributes> implements OnboardingInvitationAttributes {
    id: UUID;
    email: string;
    tokenHash: string;
    invitedBy: UUID;
    status: OnboardingInvitationStatus;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    InvitedByUser?: User;
}
//# sourceMappingURL=onboarding-invitation.model.d.ts.map