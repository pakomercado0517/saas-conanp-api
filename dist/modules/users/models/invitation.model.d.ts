import { Model, type Optional } from 'sequelize';
import type { UUID, Role } from '../../../shared/database/types';
import { Area } from '../../../modules/areas/models/area.model.js';
import { User } from './user.model.js';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export interface InvitationAttributes {
    id: UUID;
    areaId: UUID;
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
    areaId: UUID;
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
    Area?: Area;
    InvitedByUser?: User;
}
//# sourceMappingURL=invitation.model.d.ts.map