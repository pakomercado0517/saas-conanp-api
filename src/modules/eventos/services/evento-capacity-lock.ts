import type { Transaction } from 'sequelize';
import { sequelize } from '@/shared/database/index.js';

/**
 * Bloqueo transaccional de PostgreSQL para serializar reservas en el mismo
 * (actividad, fecha, slot de bloque o día libre). Evita condiciones de carrera
 * al verificar capacidad e insertar el evento en la misma transacción.
 */
export const acquireEventoCapacityAdvisoryLock = async (
  transaction: Transaction,
  actividadId: string,
  dateStr: string,
  bloqueId: string | null
): Promise<void> => {
  const slot = bloqueId ?? 'HORARIO_LIBRE';
  await sequelize.query(`SELECT pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))`, {
    bind: [`${actividadId}|${dateStr}`, slot],
    transaction,
  });
};
