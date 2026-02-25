import { Model, type Optional } from 'sequelize';
import type { UUID, DependenciaRole } from '../../../shared/database/types';
import { Dependencia } from './dependencia.model.js';
import { User } from '../../../modules/users/models/user.model.js';
export type DependenciaInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export interface DependenciaInvitationAttributes {
    id: UUID;
    dependenciaId: UUID;
    email: string;
    role: DependenciaRole;
    tokenHash: string;
    invitedBy: UUID;
    status: DependenciaInvitationStatus;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface DependenciaInvitationCreationAttributes extends Optional<DependenciaInvitationAttributes, 'id' | 'status' | 'usedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'> {
}
export declare class DependenciaInvitation extends Model<DependenciaInvitationAttributes, DependenciaInvitationCreationAttributes> implements DependenciaInvitationAttributes {
    id: UUID;
    dependenciaId: UUID;
    email: string;
    role: DependenciaRole;
    tokenHash: string;
    invitedBy: UUID;
    status: DependenciaInvitationStatus;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Dependencia?: Dependencia;
    InvitedByUser?: User;
}
//# sourceMappingURL=dependencia-invitation.model.d.ts.map