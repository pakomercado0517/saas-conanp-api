import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Actividad } from './actividad.model';
export interface CapacidadAttributes {
    id: UUID;
    organizationId: UUID;
    actividadId: UUID;
    date: string;
    limit: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CapacidadCreationAttributes extends Optional<CapacidadAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Capacidad extends Model<CapacidadAttributes, CapacidadCreationAttributes> implements CapacidadAttributes {
    id: UUID;
    organizationId: UUID;
    actividadId: UUID;
    date: string;
    limit: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    Actividad?: Actividad;
}
//# sourceMappingURL=capacidad.model.d.ts.map