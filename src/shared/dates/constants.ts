/**
 * Constantes para manejo de fechas y zonas horarias
 */

/**
 * Zona horaria de la aplicación (México)
 */
export const APP_TIMEZONE = 'America/Mexico_City' as const;

/**
 * Zona horaria de la base de datos (UTC)
 */
export const DB_TIMEZONE = 'utc' as const;

/**
 * Formatos de fecha comunes
 */
export const DATE_FORMATS = {
  /** Formato ISO completo con zona horaria */
  ISO_FULL: "yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
  /** Formato ISO sin milisegundos */
  ISO: "yyyy-MM-dd'T'HH:mm:ssZZ",
  /** Solo fecha YYYY-MM-DD */
  DATE_ONLY: 'yyyy-MM-dd',
  /** Solo hora HH:mm:ss */
  TIME_ONLY: 'HH:mm:ss',
  /** Hora corta HH:mm */
  TIME_SHORT: 'HH:mm',
  /** Para respuestas API */
  API: "yyyy-MM-dd'T'HH:mm:ssZZ",
} as const;
