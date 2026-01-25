import type { DateTime } from 'luxon';

/**
 * Tipo para fecha solo (sin hora)
 */
export type DateOnly = string; // Formato: YYYY-MM-DD

/**
 * Tipo para hora solo (sin fecha)
 */
export type TimeOnly = string; // Formato: HH:mm:ss

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
