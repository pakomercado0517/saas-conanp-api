import { Model, type Optional } from 'sequelize';
import type { UUID, Role } from '../../../shared/database/types';
import { Area } from '../../../modules/areas/models/area.model.js';
import { User } from './user.model.js';
export interface MembershipAttributes {
    id: UUID;
    userId: UUID;
    areaId: UUID;
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
    areaId: UUID;
    role: Role;
    status: 'activo' | 'inactivo' | 'suspendido';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    User?: User;
    Area?: Area;
}
//# sourceMappingURL=membership.model.d.ts.map