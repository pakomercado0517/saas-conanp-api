import { Model, type Optional } from 'sequelize';
import type { UUID, Role } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { User } from './user.model';
export interface MembershipAttributes {
    id: UUID;
    userId: UUID;
    organizationId: UUID;
    role: Role;
    status: 'activo' | 'inactivo' | 'suspendido';
    createdAt: Date;
    updatedAt: Date;
}
export interface MembershipCreationAttributes extends Optional<MembershipAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
}
export declare class Membership extends Model<MembershipAttributes, MembershipCreationAttributes> implements MembershipAttributes {
    id: UUID;
    userId: UUID;
    organizationId: UUID;
    role: Role;
    status: 'activo' | 'inactivo' | 'suspendido';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    User?: User;
    Organization?: Organization;
}
//# sourceMappingURL=membership.model.d.ts.map