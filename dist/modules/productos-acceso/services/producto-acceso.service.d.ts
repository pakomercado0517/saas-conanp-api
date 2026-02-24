import type { UUID } from '../../../shared/database/types.js';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model.js';
import type { CreateProductoAccesoDTO, UpdateProductoAccesoDTO, ListProductosAccesoDTO } from '../../../modules/productos-acceso/validators/producto-acceso.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Crea un nuevo producto de acceso y su registro de stock inicial (cantidad 0).
 * Solo los administradores pueden crear productos.
 * @param areaId - ID del área (organizationId en API); se resuelve a dependencia para persistencia.
 */
export declare const createProductoAcceso: (areaId: UUID, data: CreateProductoAccesoDTO, userId: UUID) => Promise<ProductoAcceso>;
/**
 * Obtiene un producto de acceso por ID.
 * Cualquier usuario con acceso al área puede leer.
 */
export declare const getProductoAccesoById: (productoAccesoId: UUID, areaId: UUID, userId: UUID) => Promise<ProductoAcceso>;
/**
 * Lista productos de acceso con paginación y filtros.
 * Filtro multi-tenant obligatorio por dependencia (resuelta desde areaId).
 */
export declare const listProductosAcceso: (areaId: UUID, filters: ListProductosAccesoDTO, userId: UUID) => Promise<{
    data: ProductoAcceso[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un producto de acceso.
 * Solo los administradores pueden actualizar.
 */
export declare const updateProductoAcceso: (productoAccesoId: UUID, areaId: UUID, data: UpdateProductoAccesoDTO, userId: UUID) => Promise<ProductoAcceso>;
/**
 * Elimina un producto de acceso (soft delete).
 * Solo los administradores pueden eliminar.
 */
export declare const deleteProductoAcceso: (productoAccesoId: UUID, areaId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=producto-acceso.service.d.ts.map