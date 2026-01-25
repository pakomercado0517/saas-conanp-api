import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Actividad } from './actividad.model';
export interface BloqueAttributes {
    id: UUID;
    organizationId: UUID;
    actividadId: UUID;
    date: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    isTemplate: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface BloqueCreationAttributes extends Optional<BloqueAttributes, 'id' | 'date' | 'capacity' | 'isTemplate' | 'createdAt' | 'updatedAt'> {
}
export declare class Bloque extends Model<BloqueAttributes, BloqueCreationAttributes> implements BloqueAttributes {
    id: UUID;
    organizationId: UUID;
    actividadId: UUID;
    date: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    isTemplate: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    Actividad?: Actividad;
}
//# sourceMappingURL=bloque.model.d.ts.map