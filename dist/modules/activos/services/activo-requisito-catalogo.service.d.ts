import type { UUID } from '../../../shared/database/types.js';
import { ActivoRequisitoCatalogo } from '../../../modules/activos/models/activo-requisito-catalogo.model.js';
import type { CreateActivoRequisitoCatalogoDTO, UpdateActivoRequisitoCatalogoDTO, ListActivoRequisitoCatalogoDTO } from '../../../modules/activos/validators/activo.validator.js';
import type { ActivoType } from '../../../shared/database/types.js';
/**
 * Lista entradas del catálogo de requisitos para una dependencia (y opcionalmente por tipo de activo).
 */
export declare const listCatalogo: (organizationId: UUID, filters: ListActivoRequisitoCatalogoDTO, requestingUserId: UUID) => Promise<ActivoRequisitoCatalogo[]>;
/**
 * Crea una entrada en el catálogo. Valida unicidad (dependenciaId, tipoActivo, key).
 */
export declare const createCatalogoEntry: (organizationId: UUID, data: CreateActivoRequisitoCatalogoDTO, requestingUserId: UUID) => Promise<ActivoRequisitoCatalogo>;
/**
 * Actualiza una entrada del catálogo. No se permite cambiar key, tipoActivo ni dependenciaId.
 */
export declare const updateCatalogoEntry: (organizationId: UUID, catalogoId: UUID, data: UpdateActivoRequisitoCatalogoDTO, requestingUserId: UUID) => Promise<ActivoRequisitoCatalogo>;
/**
 * Elimina una entrada del catálogo.
 */
export declare const deleteCatalogoEntry: (organizationId: UUID, catalogoId: UUID, requestingUserId: UUID) => Promise<void>;
/**
 * Obtiene las definiciones del catálogo para una dependencia y tipo de activo (para validación de requisitos).
 * Exportado para uso en activo-requisito.service.
 */
export declare const getCatalogoForActivo: (dependenciaId: UUID, tipoActivo: ActivoType) => Promise<ActivoRequisitoCatalogo[]>;
//# sourceMappingURL=activo-requisito-catalogo.service.d.ts.map