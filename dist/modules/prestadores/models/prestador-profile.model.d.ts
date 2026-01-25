import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { User } from '../../../modules/users/models/user.model';
export interface PrestadorProfileAttributes {
    id: UUID;
    userId: UUID;
    organizationId: UUID;
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
    organizationId: UUID;
    status: 'activo' | 'inactivo' | 'suspendido';
    permitExpiresAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    User?: User;
    Organization?: Organization;
}
//# sourceMappingURL=prestador-profile.model.d.ts.map