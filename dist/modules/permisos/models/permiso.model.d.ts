import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model';
import { Actividad } from '../../../modules/actividades/models/actividad.model';
export interface PermisoAttributes {
    id: UUID;
    prestadorId: UUID;
    actividadId: UUID;
    validFrom: Date;
    validTo: Date;
    status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
    documentUrl: string | null;
    /** True si el permiso se materializó para todas las áreas de la dependencia */
    appliesToAllAreas: boolean;
    /** Agrupa filas creadas en el mismo lote (mismo expediente lógico) */
    permissionGroupId: UUID | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PermisoCreationAttributes extends Optional<PermisoAttributes, 'id' | 'status' | 'documentUrl' | 'appliesToAllAreas' | 'permissionGroupId' | 'createdAt' | 'updatedAt'> {
}
export declare class Permiso extends Model<PermisoAttributes, PermisoCreationAttributes> implements PermisoAttributes {
    id: UUID;
    prestadorId: UUID;
    actividadId: UUID;
    validFrom: Date;
    validTo: Date;
    status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
    documentUrl: string | null;
    appliesToAllAreas: boolean;
    permissionGroupId: UUID | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    PrestadorProfile?: PrestadorProfile;
    Actividad?: Actividad;
}
//# sourceMappingURL=permiso.model.d.ts.map