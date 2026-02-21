import { Model, type Optional } from 'sequelize';
import type { UUID, Role } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
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
export interface InvitationCreationAttributes extends Optional<InvitationAttributes, 'id' | 'status' | 'usedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'> {
}
export declare class Invitation extends Model<InvitationAttributes, InvitationCreationAttributes> implements InvitationAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    InvitedByUser?: User;
}
//# sourceMappingURL=invitation.model.d.ts.map