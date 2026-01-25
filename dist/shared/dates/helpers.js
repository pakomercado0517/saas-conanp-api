import { DateTime } from 'luxon';
import { now, parseDate, parseDateOnly } from './utils';
/**
 * Verifica si una fecha está en el pasado
 */
export const isDateInPast = (date) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    if (!dt || !dt.isValid)
        return false;
    return dt < now();
};
/**
 * Verifica si una fecha está en el futuro
 */
export const isDateInFuture = (date) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    if (!dt || !dt.isValid)
        return false;
    return dt > now();
};
/**
 * Verifica si una fecha está dentro de un rango (inclusive)
 */
export const isDateInRange = (date, startDate, endDate) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
    if (!dt || !dt.isValid || !start || !start.isValid || !end || !end.isValid) {
        return false;
    }
    return dt >= start && dt <= end;
};
/**
 * Calcula el número de días entre dos fechas
 */
export const daysBetween = (startDate, endDate) => {
    const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
    if (!start || !start.isValid || !end || !end.isValid) {
        return null;
    }
    const diff = end.diff(start, 'days');
    return Math.floor(diff.days);
};
/**
 * Agrega días a una fecha
 */
export const addDays = (date, days) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    if (!dt || !dt.isValid)
        return null;
    return dt.plus({ days });
};
/**
 * Agrega meses a una fecha
 */
export const addMonths = (date, months) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    if (!dt || !dt.isValid)
        return null;
    return dt.plus({ months });
};
/**
 * Agrega años a una fecha
 */
export const addYears = (date, years) => {
    const dt = typeof date === 'string' ? parseDate(date) : date;
    if (!dt || !dt.isValid)
        return null;
    return dt.plus({ years });
};
/**
 * Verifica si una fecha es anterior a otra
 */
export const isBefore = (date1, date2) => {
    const dt1 = typeof date1 === 'string' ? parseDate(date1) : date1;
    const dt2 = typeof date2 === 'string' ? parseDate(date2) : date2;
    if (!dt1 || !dt1.isValid || !dt2 || !dt2.isValid) {
        return false;
    }
    return dt1 < dt2;
};
/**
 * Verifica si una fecha es posterior a otra
 */
export const isAfter = (date1, date2) => {
    const dt1 = typeof date1 === 'string' ? parseDate(date1) : date1;
    const dt2 = typeof date2 === 'string' ? parseDate(date2) : date2;
    if (!dt1 || !dt1.isValid || !dt2 || !dt2.isValid) {
        return false;
    }
    return dt1 > dt2;
};
/**
 * Verifica si dos fechas son iguales (solo fecha, sin hora)
 */
export const isSameDay = (date1, date2) => {
    const dt1 = typeof date1 === 'string' ? parseDateOnly(date1) || parseDate(date1) : date1;
    const dt2 = typeof date2 === 'string' ? parseDateOnly(date2) || parseDate(date2) : date2;
    if (!dt1 || !dt1.isValid || !dt2 || !dt2.isValid) {
        return false;
    }
    return dt1.hasSame(dt2, 'day');
};
/**
 * Obtiene el inicio del día para una fecha
 */
export const startOfDay = (date) => {
    const dt = typeof date === 'string' ? parseDate(date) || parseDateOnly(date) : date;
    if (!dt || !dt.isValid)
        return null;
    return dt.startOf('day');
};
/**
 * Obtiene el fin del día para una fecha
 */
export const endOfDay = (date) => {
    const dt = typeof date === 'string' ? parseDate(date) || parseDateOnly(date) : date;
    if (!dt || !dt.isValid)
        return null;
    return dt.endOf('day');
};
//# sourceMappingURL=helpers.js.map