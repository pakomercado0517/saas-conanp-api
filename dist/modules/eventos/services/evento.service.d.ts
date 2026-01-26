import type { UUID } from '../../../shared/database/types.js';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model.js';
import type { CreateEventoDTO, UpdateEventoDTO, ListEventosDTO } from '../../../modules/eventos/validators/evento.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Crea un nuevo evento operativo.
 * Requiere validaciones estrictas de negocio y se ejecuta en una transacción.
 *
 * @param data - Datos del evento (con validación condicional por tipo de agenda)
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea
 * @returns Evento creado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad, bloque o prestador no existen
 * @throws {ValidationError} Si no se cumplen las validaciones de negocio
 */
export declare const createEvento: (data: CreateEventoDTO, organizationId: UUID, userId: UUID) => Promise<EventoOperativo>;
/**
 * Obtiene un evento por ID.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Evento encontrado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
export declare const getEventoById: (eventoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<EventoOperativo>;
/**
 * Lista eventos con paginación y filtros.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de eventos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listEventos: (organizationId: UUID, filters: ListEventosDTO, requestingUserId: UUID) => Promise<{
    data: EventoOperativo[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un evento existente.
 * Valida permisos granulares y revalida capacidad si se actualizan campos relevantes.
 *
 * @param eventoId - ID del evento a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Evento actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 * @throws {ValidationError} Si no se cumplen las validaciones de negocio
 */
export declare const updateEvento: (eventoId: UUID, organizationId: UUID, data: UpdateEventoDTO, requestingUserId: UUID) => Promise<EventoOperativo>;
/**
 * Elimina un evento (soft delete).
 * Valida permisos granulares: prestadores solo pueden eliminar sus propios eventos.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
export declare const deleteEvento: (eventoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<void>;
//# sourceMappingURL=evento.service.d.ts.map