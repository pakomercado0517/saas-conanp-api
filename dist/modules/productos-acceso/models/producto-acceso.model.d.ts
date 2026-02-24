import { Model, type Optional } from 'sequelize';
import type { UUID } from '@/shared/database/types';
import type { ProductoAccesoTipo } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
export interface ProductoAccesoAttributes {
    id: UUID;
    dependenciaId: UUID;
    name: string;
    tipo: ProductoAccesoTipo;
    vigenciaDias: number;
    precioReferencia: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface ProductoAccesoCreationAttributes extends Optional<ProductoAccesoAttributes, 'id' | 'precioReferencia' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class ProductoAcceso extends Model<ProductoAccesoAttributes, ProductoAccesoCreationAttributes> implements ProductoAccesoAttributes {
    id: UUID;
    dependenciaId: UUID;
    name: string;
    tipo: ProductoAccesoTipo;
    vigenciaDias: number;
    precioReferencia: string | null;
    active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Dependencia?: Dependencia;
}
//# sourceMappingURL=producto-acceso.model.d.ts.map