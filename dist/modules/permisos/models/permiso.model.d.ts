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
    createdAt: Date;
    updatedAt: Date;
}
export interface PermisoCreationAttributes extends Optional<PermisoAttributes, 'id' | 'status' | 'documentUrl' | 'createdAt' | 'updatedAt'> {
}
export declare class Permiso extends Model<PermisoAttributes, PermisoCreationAttributes> implements PermisoAttributes {
    id: UUID;
    prestadorId: UUID;
    actividadId: UUID;
    validFrom: Date;
    validTo: Date;
    status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
    documentUrl: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    PrestadorProfile?: PrestadorProfile;
    Actividad?: Actividad;
}
//# sourceMappingURL=permiso.model.d.ts.map