import { Model, type Optional } from 'sequelize';
import type { UUID } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { User } from '@/modules/users/models/user.model.js';
export interface PrestadorProfileAttributes {
    id: UUID;
    userId: UUID;
    dependenciaId: UUID;
    status: 'activo' | 'inactivo' | 'suspendido';
    permitExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PrestadorProfileCreationAttributes extends Optional<PrestadorProfileAttributes, 'id' | 'status' | 'permitExpiresAt' | 'createdAt' | 'updatedAt'> {
}
export declare class PrestadorProfile extends Model<PrestadorProfileAttributes, PrestadorProfileCreationAttributes> implements PrestadorProfileAttributes {
    id: UUID;
    userId: UUID;
    dependenciaId: UUID;
    status: 'activo' | 'inactivo' | 'suspendido';
    permitExpiresAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    User?: User;
    Dependencia?: Dependencia;
}
//# sourceMappingURL=prestador-profile.model.d.ts.map