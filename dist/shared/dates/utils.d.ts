import { DateTime } from 'luxon';
import type { DateOnly, TimeOnly } from './types';
/**
 * Obtiene la fecha y hora actual en la zona horaria de la aplicación
 */
export declare const now: () => DateTime;
/**
 * Convierte una DateTime de la zona horaria de la aplicación a UTC
 * para guardar en la base de datos
 */
export declare const toUTC: (dateTime: DateTime) => DateTime;
/**
 * Convierte una fecha UTC de la base de datos a la zona horaria de la aplicación
 */
export declare const fromUTC: (utcDateTime: DateTime | string | Date) => DateTime;
/**
 * Convierte una DateTime a string ISO en UTC para guardar en BD
 */
export declare const toUTCString: (dateTime: DateTime) => string | null;
/**
 * Convierte una fecha UTC de BD a string ISO en zona horaria de la aplicación
 */
export declare const fromUTCString: (utcString: string | null | undefined) => string | null;
/**
 * Parsea un string ISO a DateTime en la zona horaria de la aplicación
 */
export declare const parseDate: (dateString: string | null | undefined) => DateTime | null;
/**
 * Convierte una DateTime a string de fecha solo (YYYY-MM-DD)
 */
export declare const toDateOnly: (dateTime: DateTime) => DateOnly | null;
/**
 * Parsea un string de fecha solo (YYYY-MM-DD) a DateTime
 */
export declare const parseDateOnly: (dateString: string | null | undefined) => DateTime | null;
/**
 * Convierte una DateTime a string de hora solo (HH:mm:ss)
 */
export declare const toTimeOnly: (dateTime: DateTime) => TimeOnly | null;
/**
 * Parsea un string de hora solo (HH:mm:ss) a DateTime (usando fecha actual)
 */
export declare const parseTimeOnly: (timeString: string | null | undefined, baseDate?: DateTime) => DateTime | null;
/**
 * Formatea una DateTime para respuestas API (ISO en zona horaria de la aplicación)
 */
export declare const formatForAPI: (dateTime: DateTime | null | undefined) => string | null;
/**
 * Convierte un Date nativo de JavaScript a DateTime en zona horaria de la aplicación
 */
export declare const fromJSDate: (date: Date) => DateTime;
/**
 * Convierte una DateTime a Date nativo de JavaScript
 */
export declare const toJSDate: (dateTime: DateTime) => Date;
/**
 * Convierte una fecha DATEONLY de BD (string YYYY-MM-DD) a DateTime
 */
export declare const fromDateOnlyDB: (dateString: string | null | undefined) => DateTime | null;
/**
 * Convierte una DateTime a string DATEONLY para BD (YYYY-MM-DD)
 */
export declare const toDateOnlyDB: (dateTime: DateTime | null | undefined) => string | null;
//# sourceMappingURL=utils.d.ts.map