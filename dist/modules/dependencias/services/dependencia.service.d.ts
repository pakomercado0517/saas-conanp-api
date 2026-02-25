import type { UUID } from '../../../shared/database/types.js';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import type { CreateDependenciaDTO, UpdateDependenciaDTO, ListDependenciasDTO, CreateAreaUnderDependenciaDTO } from '../validators/dependencia.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Crea una dependencia y asigna al usuario como owner. Crea suscripción FREE. No crea área.
 * Respeta límite FREE: 1 dependencia por usuario.
 */
export declare const createDependencia: (data: CreateDependenciaDTO, userId: UUID) => Promise<Dependencia>;
/**
 * Lista dependencias a las que el usuario tiene acceso vía DependenciaMembership.
 */
export declare const listDependencias: (filters: ListDependenciasDTO, userId: UUID) => Promise<{
    data: Dependencia[];
    pagination: PaginationMeta;
}>;
/**
 * Obtiene una dependencia por ID. El usuario debe tener acceso (DependenciaMembership o área).
 */
export declare const getDependenciaById: (dependenciaId: UUID, userId: UUID) => Promise<Dependencia>;
/**
 * Actualiza una dependencia. El usuario debe tener acceso.
 */
export declare const updateDependencia: (dependenciaId: UUID, data: UpdateDependenciaDTO, userId: UUID) => Promise<Dependencia>;
/**
 * Soft delete de una dependencia. El usuario debe tener acceso.
 */
export declare const deleteDependencia: (dependenciaId: UUID, userId: UUID) => Promise<void>;
/**
 * Crea un área bajo una dependencia. El usuario debe tener acceso a la dependencia.
 * Plan FREE = 1 área por dependencia; se verifica antes de crear.
 */
export declare const createAreaUnderDependencia: (dependenciaId: UUID, data: CreateAreaUnderDependenciaDTO, userId: UUID) => Promise<Area>;
/**
 * Lista áreas de una dependencia. El usuario debe tener acceso a la dependencia.
 */
export declare const listAreasByDependencia: (dependenciaId: UUID, userId: UUID) => Promise<Area[]>;
//# sourceMappingURL=dependencia.service.d.ts.map