import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model';
export interface StockAccesoAttributes {
    id: UUID;
    organizationId: UUID;
    productoAccesoId: UUID;
    cantidad: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface StockAccesoCreationAttributes extends Optional<StockAccesoAttributes, 'id' | 'cantidad' | 'createdAt' | 'updatedAt'> {
}
export declare class StockAcceso extends Model<StockAccesoAttributes, StockAccesoCreationAttributes> implements StockAccesoAttributes {
    id: UUID;
    organizationId: UUID;
    productoAccesoId: UUID;
    cantidad: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    ProductoAcceso?: ProductoAcceso;
}
//# sourceMappingURL=stock-acceso.model.d.ts.map