import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
export interface DependenciaAttributes {
    id: UUID;
    name: string;
    settings: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface DependenciaCreationAttributes extends Optional<DependenciaAttributes, 'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Dependencia extends Model<DependenciaAttributes, DependenciaCreationAttributes> implements DependenciaAttributes {
    id: UUID;
    name: string;
    settings: Record<string, unknown>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=dependencia.model.d.ts.map