import type { Transaction } from 'sequelize';
/**
 * Bloqueo transaccional de PostgreSQL para serializar reservas en el mismo
 * (actividad, fecha, slot de bloque o día libre). Evita condiciones de carrera
 * al verificar capacidad e insertar el evento en la misma transacción.
 */
export declare const acquireEventoCapacityAdvisoryLock: (transaction: Transaction, actividadId: string, dateStr: string, bloqueId: string | null) => Promise<void>;
//# sourceMappingURL=evento-capacity-lock.d.ts.map