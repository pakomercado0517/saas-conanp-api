import { DateTime } from 'luxon';
/**
 * Verifica si una fecha está en el pasado
 */
export declare const isDateInPast: (date: DateTime | string) => boolean;
/**
 * Verifica si una fecha está en el futuro
 */
export declare const isDateInFuture: (date: DateTime | string) => boolean;
/**
 * Verifica si una fecha está dentro de un rango (inclusive)
 */
export declare const isDateInRange: (date: DateTime | string, startDate: DateTime | string, endDate: DateTime | string) => boolean;
/**
 * Calcula el número de días entre dos fechas
 */
export declare const daysBetween: (startDate: DateTime | string, endDate: DateTime | string) => number | null;
/**
 * Agrega días a una fecha
 */
export declare const addDays: (date: DateTime | string, days: number) => DateTime | null;
/**
 * Agrega meses a una fecha
 */
export declare const addMonths: (date: DateTime | string, months: number) => DateTime | null;
/**
 * Agrega años a una fecha
 */
export declare const addYears: (date: DateTime | string, years: number) => DateTime | null;
/**
 * Verifica si una fecha es anterior a otra
 */
export declare const isBefore: (date1: DateTime | string, date2: DateTime | string) => boolean;
/**
 * Verifica si una fecha es posterior a otra
 */
export declare const isAfter: (date1: DateTime | string, date2: DateTime | string) => boolean;
/**
 * Verifica si dos fechas son iguales (solo fecha, sin hora)
 */
export declare const isSameDay: (date1: DateTime | string, date2: DateTime | string) => boolean;
/**
 * Obtiene el inicio del día para una fecha
 */
export declare const startOfDay: (date: DateTime | string) => DateTime | null;
/**
 * Obtiene el fin del día para una fecha
 */
export declare const endOfDay: (date: DateTime | string) => DateTime | null;
//# sourceMappingURL=helpers.d.ts.map