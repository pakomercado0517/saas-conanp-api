import { Model, type Optional } from 'sequelize';
import type { UUID, DependenciaRole } from '@/shared/database/types';
import { Dependencia } from './dependencia.model.js';
import { User } from '@/modules/users/models/user.model.js';
export interface DependenciaMembershipAttributes {
    id: UUID;
    userId: UUID;
    dependenciaId: UUID;
    role: DependenciaRole;
    status: 'activo' | 'inactivo' | 'suspendido';
    createdAt: Date;
    updatedAt: Date;
}
export interface DependenciaMembershipCreationAttributes extends Optional<DependenciaMembershipAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
}
export declare class DependenciaMembership extends Model<DependenciaMembershipAttributes, DependenciaMembershipCreationAttributes> implements DependenciaMembershipAttributes {
    id: UUID;
    userId: UUID;
    dependenciaId: UUID;
    role: DependenciaRole;
    status: 'activo' | 'inactivo' | 'suspendido';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Dependencia?: Dependencia;
    User?: User;
}
//# sourceMappingURL=dependencia-membership.model.d.ts.map