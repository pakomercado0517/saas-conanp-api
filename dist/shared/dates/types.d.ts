import type { DateTime } from 'luxon';
/**
 * Tipo para fecha solo (sin hora)
 */
export type DateOnly = string;
/**
 * Tipo para hora solo (sin fecha)
 */
export type TimeOnly = string;
/**
 * Tipo para DateTime en zona horaria de la aplicación
 */
export type AppDateTime = DateTime;
/**
 * Tipo para DateTime en UTC
 */
export type UTCDateTime = DateTime;
/**
 * Opciones para formateo de fechas
 */
export interface FormatOptions {
    format?: string;
    includeTime?: boolean;
    includeSeconds?: boolean;
}
//# sourceMappingURL=types.d.ts.map