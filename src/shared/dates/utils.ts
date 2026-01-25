import { DateTime } from 'luxon';
import { APP_TIMEZONE, DB_TIMEZONE, DATE_FORMATS } from './constants';
import type { DateOnly, TimeOnly } from './types';

/**
 * Obtiene la fecha y hora actual en la zona horaria de la aplicación
 */
export const now = (): DateTime => {
  return DateTime.now().setZone(APP_TIMEZONE);
};

/**
 * Convierte una DateTime de la zona horaria de la aplicación a UTC
 * para guardar en la base de datos
 */
export const toUTC = (dateTime: DateTime): DateTime => {
  return dateTime.setZone(APP_TIMEZONE).toUTC();
};

/**
 * Convierte una fecha UTC de la base de datos a la zona horaria de la aplicación
 */
export const fromUTC = (utcDateTime: DateTime | string | Date): DateTime => {
  if (typeof utcDateTime === 'string') {
    return DateTime.fromISO(utcDateTime, { zone: DB_TIMEZONE }).setZone(APP_TIMEZONE);
  }
  if (utcDateTime instanceof Date) {
    return DateTime.fromJSDate(utcDateTime, { zone: DB_TIMEZONE }).setZone(APP_TIMEZONE);
  }
  return utcDateTime.setZone(DB_TIMEZONE).setZone(APP_TIMEZONE);
};

/**
 * Convierte una DateTime a string ISO en UTC para guardar en BD
 */
export const toUTCString = (dateTime: DateTime): string | null => {
  return toUTC(dateTime).toISO();
};

/**
 * Convierte una fecha UTC de BD a string ISO en zona horaria de la aplicación
 */
export const fromUTCString = (utcString: string | null | undefined): string | null => {
  if (!utcString) return null;
  return fromUTC(utcString).toISO();
};

/**
 * Parsea un string ISO a DateTime en la zona horaria de la aplicación
 */
export const parseDate = (dateString: string | null | undefined): DateTime | null => {
  if (!dateString) return null;

  const dt = DateTime.fromISO(dateString, { zone: APP_TIMEZONE });
  return dt.isValid ? dt : null;
};

/**
 * Convierte una DateTime a string de fecha solo (YYYY-MM-DD)
 */
export const toDateOnly = (dateTime: DateTime): DateOnly | null => {
  if (!dateTime.isValid) return null;
  return dateTime.setZone(APP_TIMEZONE).toFormat(DATE_FORMATS.DATE_ONLY);
};

/**
 * Parsea un string de fecha solo (YYYY-MM-DD) a DateTime
 */
export const parseDateOnly = (dateString: string | null | undefined): DateTime | null => {
  if (!dateString) return null;

  const dt = DateTime.fromFormat(dateString, DATE_FORMATS.DATE_ONLY, {
    zone: APP_TIMEZONE,
  });
  return dt.isValid ? dt : null;
};

/**
 * Convierte una DateTime a string de hora solo (HH:mm:ss)
 */
export const toTimeOnly = (dateTime: DateTime): TimeOnly | null => {
  if (!dateTime.isValid) return null;
  return dateTime.setZone(APP_TIMEZONE).toFormat(DATE_FORMATS.TIME_ONLY);
};

/**
 * Parsea un string de hora solo (HH:mm:ss) a DateTime (usando fecha actual)
 */
export const parseTimeOnly = (
  timeString: string | null | undefined,
  baseDate?: DateTime
): DateTime | null => {
  if (!timeString) return null;

  const base = baseDate || now();
  const dt = DateTime.fromFormat(
    `${base.toFormat(DATE_FORMATS.DATE_ONLY)} ${timeString}`,
    `${DATE_FORMATS.DATE_ONLY} ${DATE_FORMATS.TIME_ONLY}`,
    { zone: APP_TIMEZONE }
  );
  return dt.isValid ? dt : null;
};

/**
 * Formatea una DateTime para respuestas API (ISO en zona horaria de la aplicación)
 */
export const formatForAPI = (dateTime: DateTime | null | undefined): string | null => {
  if (!dateTime || !dateTime.isValid) return null;
  return dateTime.setZone(APP_TIMEZONE).toISO();
};

/**
 * Convierte un Date nativo de JavaScript a DateTime en zona horaria de la aplicación
 */
export const fromJSDate = (date: Date): DateTime => {
  return DateTime.fromJSDate(date, { zone: APP_TIMEZONE });
};

/**
 * Convierte una DateTime a Date nativo de JavaScript
 */
export const toJSDate = (dateTime: DateTime): Date => {
  return dateTime.toJSDate();
};

/**
 * Convierte una fecha DATEONLY de BD (string YYYY-MM-DD) a DateTime
 */
export const fromDateOnlyDB = (dateString: string | null | undefined): DateTime | null => {
  if (!dateString) return null;
  return parseDateOnly(dateString);
};

/**
 * Convierte una DateTime a string DATEONLY para BD (YYYY-MM-DD)
 */
export const toDateOnlyDB = (dateTime: DateTime | null | undefined): string | null => {
  if (!dateTime || !dateTime.isValid) return null;
  return toDateOnly(dateTime);
};
