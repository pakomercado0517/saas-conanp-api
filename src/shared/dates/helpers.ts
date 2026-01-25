import { DateTime } from 'luxon';
import { now, parseDate, parseDateOnly } from './utils';

/**
 * Verifica si una fecha está en el pasado
 */
export const isDateInPast = (date: DateTime | string): boolean => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  if (!dt || !dt.isValid) return false;
  return dt < now();
};

/**
 * Verifica si una fecha está en el futuro
 */
export const isDateInFuture = (date: DateTime | string): boolean => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  if (!dt || !dt.isValid) return false;
  return dt > now();
};

/**
 * Verifica si una fecha está dentro de un rango (inclusive)
 */
export const isDateInRange = (
  date: DateTime | string,
  startDate: DateTime | string,
  endDate: DateTime | string
): boolean => {
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
export const daysBetween = (
  startDate: DateTime | string,
  endDate: DateTime | string
): number | null => {
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
export const addDays = (date: DateTime | string, days: number): DateTime | null => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  if (!dt || !dt.isValid) return null;
  return dt.plus({ days });
};

/**
 * Agrega meses a una fecha
 */
export const addMonths = (date: DateTime | string, months: number): DateTime | null => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  if (!dt || !dt.isValid) return null;
  return dt.plus({ months });
};

/**
 * Agrega años a una fecha
 */
export const addYears = (date: DateTime | string, years: number): DateTime | null => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  if (!dt || !dt.isValid) return null;
  return dt.plus({ years });
};

/**
 * Verifica si una fecha es anterior a otra
 */
export const isBefore = (date1: DateTime | string, date2: DateTime | string): boolean => {
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
export const isAfter = (date1: DateTime | string, date2: DateTime | string): boolean => {
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
export const isSameDay = (date1: DateTime | string, date2: DateTime | string): boolean => {
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
export const startOfDay = (date: DateTime | string): DateTime | null => {
  const dt = typeof date === 'string' ? parseDate(date) || parseDateOnly(date) : date;
  if (!dt || !dt.isValid) return null;
  return dt.startOf('day');
};

/**
 * Obtiene el fin del día para una fecha
 */
export const endOfDay = (date: DateTime | string): DateTime | null => {
  const dt = typeof date === 'string' ? parseDate(date) || parseDateOnly(date) : date;
  if (!dt || !dt.isValid) return null;
  return dt.endOf('day');
};

/**
 * Calcula el número de minutos entre dos fechas
 */
export const minutesBetween = (
  startDate: DateTime | string,
  endDate: DateTime | string
): number | null => {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  if (!start || !start.isValid || !end || !end.isValid) {
    return null;
  }

  const diff = end.diff(start, 'minutes');
  return Math.floor(diff.minutes);
};

/**
 * Verifica si un rango de tiempo es válido (inicio < fin)
 */
export const isValidTimeRange = (start: DateTime | string, end: DateTime | string): boolean => {
  const startDt = typeof start === 'string' ? parseDate(start) : start;
  const endDt = typeof end === 'string' ? parseDate(end) : end;

  if (!startDt || !startDt.isValid || !endDt || !endDt.isValid) {
    return false;
  }

  return startDt < endDt;
};

/**
 * Verifica si dos rangos de tiempo se solapan
 *
 * Dos rangos se solapan si:
 * - El inicio de A está dentro del rango de B, o
 * - El fin de A está dentro del rango de B, o
 * - A contiene completamente a B
 *
 * @param aStart - Inicio del primer rango
 * @param aEnd - Fin del primer rango
 * @param bStart - Inicio del segundo rango
 * @param bEnd - Fin del segundo rango
 * @returns true si los rangos se solapan, false en caso contrario
 */
export const doTimeRangesOverlap = (
  aStart: DateTime | string,
  aEnd: DateTime | string,
  bStart: DateTime | string,
  bEnd: DateTime | string
): boolean => {
  const aStartDt = typeof aStart === 'string' ? parseDate(aStart) : aStart;
  const aEndDt = typeof aEnd === 'string' ? parseDate(aEnd) : aEnd;
  const bStartDt = typeof bStart === 'string' ? parseDate(bStart) : bStart;
  const bEndDt = typeof bEnd === 'string' ? parseDate(bEnd) : bEnd;

  if (
    !aStartDt ||
    !aStartDt.isValid ||
    !aEndDt ||
    !aEndDt.isValid ||
    !bStartDt ||
    !bStartDt.isValid ||
    !bEndDt ||
    !bEndDt.isValid
  ) {
    return false;
  }

  // Verificar que los rangos sean válidos (inicio < fin)
  if (aStartDt >= aEndDt || bStartDt >= bEndDt) {
    return false;
  }

  // Dos rangos se solapan si:
  // - El inicio de A está dentro de B: aStart >= bStart && aStart < bEnd
  // - El fin de A está dentro de B: aEnd > bStart && aEnd <= bEnd
  // - A contiene a B: aStart <= bStart && aEnd >= bEnd
  // Simplificado: se solapan si no están completamente separados
  return !(aEndDt <= bStartDt || aStartDt >= bEndDt);
};

/**
 * Verifica si una fecha está dentro de un rango de vigencia (inclusive)
 *
 * Útil para validar permisos, ofertas u otros recursos con fechas de vigencia.
 *
 * @param date - Fecha a verificar
 * @param validFrom - Fecha de inicio de vigencia
 * @param validTo - Fecha de fin de vigencia
 * @returns true si la fecha está dentro del rango de vigencia, false en caso contrario
 */
export const isWithinValidityRange = (
  date: DateTime | string,
  validFrom: DateTime | string,
  validTo: DateTime | string
): boolean => {
  const dt = typeof date === 'string' ? parseDate(date) : date;
  const from = typeof validFrom === 'string' ? parseDate(validFrom) : validFrom;
  const to = typeof validTo === 'string' ? parseDate(validTo) : validTo;

  if (!dt || !dt.isValid || !from || !from.isValid || !to || !to.isValid) {
    return false;
  }

  // Verificar que el rango de vigencia sea válido
  if (from > to) {
    return false;
  }

  // Verificar si la fecha está dentro del rango (inclusive)
  return dt >= from && dt <= to;
};
