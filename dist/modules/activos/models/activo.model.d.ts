import { Model, type Optional } from 'sequelize';
import type { UUID, ActivoType } from '../../../shared/database/types';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
export interface ActivoAttributes {
    id: UUID;
    dependenciaId: UUID;
    ownerId: UUID;
    type: ActivoType;
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface ActivoCreationAttributes extends Optional<ActivoAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Activo extends Model<ActivoAttributes, ActivoCreationAttributes> implements ActivoAttributes {
    id: UUID;
    dependenciaId: UUID;
    ownerId: UUID;
    type: ActivoType;
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Dependencia?: Dependencia;
    Owner?: PrestadorProfile;
}
//# sourceMappingURL=activo.model.d.ts.map