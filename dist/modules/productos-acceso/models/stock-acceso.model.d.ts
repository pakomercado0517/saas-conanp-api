import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model.js';
export interface StockAccesoAttributes {
    id: UUID;
    dependenciaId: UUID;
    productoAccesoId: UUID;
    cantidad: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface StockAccesoCreationAttributes extends Optional<StockAccesoAttributes, 'id' | 'cantidad' | 'createdAt' | 'updatedAt'> {
}
export declare class StockAcceso extends Model<StockAccesoAttributes, StockAccesoCreationAttributes> implements StockAccesoAttributes {
    id: UUID;
    dependenciaId: UUID;
    productoAccesoId: UUID;
    cantidad: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Dependencia?: Dependencia;
    ProductoAcceso?: ProductoAcceso;
}
//# sourceMappingURL=stock-acceso.model.d.ts.map