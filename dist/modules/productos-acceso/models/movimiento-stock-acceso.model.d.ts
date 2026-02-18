import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import type { MovimientoStockTipo, MovimientoStockMotivo } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model';
import { User } from '../../../modules/users/models/user.model';
export interface MovimientoStockAccesoAttributes {
    id: UUID;
    organizationId: UUID;
    productoAccesoId: UUID;
    tipo: MovimientoStockTipo;
    cantidad: number;
    fecha: string;
    motivo: MovimientoStockMotivo;
    referencia: string | null;
    montoUnitario: string | null;
    montoTotal: string | null;
    prestadorId: UUID | null;
    eventoId: UUID | null;
    createdBy: UUID;
    notas: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface MovimientoStockAccesoCreationAttributes extends Optional<MovimientoStockAccesoAttributes, 'id' | 'referencia' | 'montoUnitario' | 'montoTotal' | 'prestadorId' | 'eventoId' | 'notas' | 'createdAt' | 'updatedAt'> {
}
export declare class MovimientoStockAcceso extends Model<MovimientoStockAccesoAttributes, MovimientoStockAccesoCreationAttributes> implements MovimientoStockAccesoAttributes {
    id: UUID;
    organizationId: UUID;
    productoAccesoId: UUID;
    tipo: MovimientoStockTipo;
    cantidad: number;
    fecha: string;
    motivo: MovimientoStockMotivo;
    referencia: string | null;
    montoUnitario: string | null;
    montoTotal: string | null;
    prestadorId: UUID | null;
    eventoId: UUID | null;
    createdBy: UUID;
    notas: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    ProductoAcceso?: ProductoAcceso;
    PrestadorProfile?: PrestadorProfile | null;
    EventoOperativo?: EventoOperativo | null;
    CreatedByUser?: User;
}
//# sourceMappingURL=movimiento-stock-acceso.model.d.ts.map