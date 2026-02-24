import type { UUID } from '../../../shared/database/types.js';
import { Capacidad } from '../../../modules/actividades/models/capacidad.model.js';
import type { CreateCapacidadDTO, UpdateCapacidadDTO } from '../../../modules/capacidad/validators/capacidad.validator.js';
import { DateTime } from '../../../shared/dates/index.js';
/**
 * Tipo de retorno para verificación de disponibilidad
 */
export interface DisponibilidadResult {
    disponible: boolean;
    capacidadTotal: number;
    capacidadUsada: number;
    capacidadDisponible: number;
    limite: number;
}
/**
 * Crea una nueva capacidad para una actividad y fecha.
 * Solo los administradores pueden crear capacidades.
 *
 * @param data - Datos de la capacidad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Capacidad creada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe
 * @throws {ConflictError} Si ya existe una capacidad para esa actividad y fecha
 */
export declare const createCapacidad: (data: CreateCapacidadDTO, organizationId: UUID, userId: UUID) => Promise<Capacidad>;
/**
 * Actualiza una capacidad existente.
 * Solo los administradores pueden actualizar capacidades.
 *
 * @param capacidadId - ID de la capacidad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Capacidad actualizada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la capacidad no existe
 * @throws {ConflictError} Si al actualizar la fecha, ya existe otra capacidad para la nueva fecha
 */
export declare const updateCapacidad: (capacidadId: UUID, organizationId: UUID, data: UpdateCapacidadDTO, userId: UUID) => Promise<Capacidad>;
/**
 * Verifica disponibilidad de capacidad para un bloque específico (actividades BLOQUES).
 *
 * @param actividadId - ID de la actividad
 * @param bloqueId - ID del bloque
 * @param date - Fecha (DateTime o string YYYY-MM-DD)
 * @param cantidad - Cantidad de personas/operaciones a verificar (default: 1)
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Resultado de disponibilidad
 * @throws {NotFoundError} Si la actividad o bloque no existen
 * @throws {ValidationError} Si la actividad no tiene tipo BLOQUES
 */
export declare const verificarDisponibilidadPorBloque: (actividadId: UUID, bloqueId: UUID, date: DateTime | string, cantidad: number, organizationId: UUID) => Promise<DisponibilidadResult>;
/**
 * Verifica disponibilidad de capacidad para un día completo (actividades HORARIO_LIBRE).
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha (DateTime o string YYYY-MM-DD)
 * @param cantidad - Cantidad de personas/operaciones a verificar (default: 1)
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Resultado de disponibilidad
 * @throws {NotFoundError} Si la actividad no existe o no hay capacidad definida
 * @throws {ValidationError} Si la actividad no tiene tipo HORARIO_LIBRE
 */
export declare const verificarDisponibilidadPorDia: (actividadId: UUID, date: DateTime | string, cantidad: number, organizationId: UUID) => Promise<DisponibilidadResult>;
/**
 * Helper interno: Calcula y retorna la capacidad usada para una actividad, fecha y bloque (opcional).
 * Esta función puede ser usada por otros servicios (ej: al crear eventos) para verificar disponibilidad.
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha en formato YYYY-MM-DD
 * @param organizationId - ID de la organización (multi-tenant)
 * @param bloqueId - ID del bloque (opcional, solo para BLOQUES)
 * @returns Capacidad usada calculada
 */
export declare const actualizarCapacidadUsada: (actividadId: UUID, date: string, organizationId: UUID, bloqueId?: UUID | null) => Promise<number>;
//# sourceMappingURL=capacidad.service.d.ts.map