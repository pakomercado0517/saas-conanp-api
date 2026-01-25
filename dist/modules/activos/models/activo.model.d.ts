import { Model, type Optional } from 'sequelize';
import type { UUID, ActivoType } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model';
export interface ActivoAttributes {
    id: UUID;
    organizationId: UUID;
    ownerId: UUID;
    type: ActivoType;
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
    createdAt: Date;
    updatedAt: Date;
}
export interface ActivoCreationAttributes extends Optional<ActivoAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
}
export declare class Activo extends Model<ActivoAttributes, ActivoCreationAttributes> implements ActivoAttributes {
    id: UUID;
    organizationId: UUID;
    ownerId: UUID;
    type: ActivoType;
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    Owner?: PrestadorProfile;
}
//# sourceMappingURL=activo.model.d.ts.map