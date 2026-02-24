import { Model, type Optional } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Actividad } from './actividad.model.js';
export interface BloqueAttributes {
    id: UUID;
    areaId: UUID;
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
    areaId: UUID;
    actividadId: UUID;
    date: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    isTemplate: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Area?: Area;
    Actividad?: Actividad;
}
//# sourceMappingURL=bloque.model.d.ts.map