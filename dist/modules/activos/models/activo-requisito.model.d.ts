import { Model, type Optional } from 'sequelize';
import type { UUID } from '@/shared/database/types';
import { Activo } from './activo.model';
export interface ActivoRequisitoAttributes {
    id: UUID;
    activoId: UUID;
    key: string;
    value: string | null;
    documentUrl: string | null;
    validated: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ActivoRequisitoCreationAttributes extends Optional<ActivoRequisitoAttributes, 'id' | 'value' | 'documentUrl' | 'validated' | 'createdAt' | 'updatedAt'> {
}
export declare class ActivoRequisito extends Model<ActivoRequisitoAttributes, ActivoRequisitoCreationAttributes> implements ActivoRequisitoAttributes {
    id: UUID;
    activoId: UUID;
    key: string;
    value: string | null;
    documentUrl: string | null;
    validated: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Activo?: Activo;
}
//# sourceMappingURL=activo-requisito.model.d.ts.map