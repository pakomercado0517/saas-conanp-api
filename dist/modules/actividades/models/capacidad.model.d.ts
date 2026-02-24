import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import { Actividad } from './actividad.model.js';
export interface CapacidadAttributes {
    id: UUID;
    areaId: UUID;
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
    areaId: UUID;
    actividadId: UUID;
    date: string;
    limit: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Area?: Area;
    Actividad?: Actividad;
}
//# sourceMappingURL=capacidad.model.d.ts.map