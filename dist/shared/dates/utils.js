import { DateTime } from 'luxon';
import { APP_TIMEZONE, DB_TIMEZONE, DATE_FORMATS } from './constants';
/**
 * Obtiene la fecha y hora actual en la zona horaria de la aplicación
 */
export const now = () => {
    return DateTime.now().setZone(APP_TIMEZONE);
};
/**
 * Convierte una DateTime de la zona horaria de la aplicación a UTC
 * para guardar en la base de datos
 */
export const toUTC = (dateTime) => {
    return dateTime.setZone(APP_TIMEZONE).toUTC();
};
/**
 * Convierte una fecha UTC de la base de datos a la zona horaria de la aplicación
 */
export const fromUTC = (utcDateTime) => {
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
export const toUTCString = (dateTime) => {
    return toUTC(dateTime).toISO();
};
/**
 * Convierte una fecha UTC de BD a string ISO en zona horaria de la aplicación
 */
export const fromUTCString = (utcString) => {
    if (!utcString)
        return null;
    return fromUTC(utcString).toISO();
};
/**
 * Parsea un string ISO a DateTime en la zona horaria de la aplicación
 */
export const parseDate = (dateString) => {
    if (!dateString)
        return null;
    const dt = DateTime.fromISO(dateString, { zone: APP_TIMEZONE });
    return dt.isValid ? dt : null;
};
/**
 * Convierte una DateTime a string de fecha solo (YYYY-MM-DD)
 */
export const toDateOnly = (dateTime) => {
    if (!dateTime.isValid)
        return null;
    return dateTime.setZone(APP_TIMEZONE).toFormat(DATE_FORMATS.DATE_ONLY);
};
/**
 * Parsea un string de fecha solo (YYYY-MM-DD) a DateTime
 */
export const parseDateOnly = (dateString) => {
    if (!dateString)
        return null;
    const dt = DateTime.fromFormat(dateString, DATE_FORMATS.DATE_ONLY, {
        zone: APP_TIMEZONE,
    });
    return dt.isValid ? dt : null;
};
/**
 * Convierte una DateTime a string de hora solo (HH:mm:ss)
 */
export const toTimeOnly = (dateTime) => {
    if (!dateTime.isValid)
        return null;
    return dateTime.setZone(APP_TIMEZONE).toFormat(DATE_FORMATS.TIME_ONLY);
};
/**
 * Parsea un string de hora solo (HH:mm:ss) a DateTime (usando fecha actual)
 */
export const parseTimeOnly = (timeString, baseDate) => {
    if (!timeString)
        return null;
    const base = baseDate || now();
    const dt = DateTime.fromFormat(`${base.toFormat(DATE_FORMATS.DATE_ONLY)} ${timeString}`, `${DATE_FORMATS.DATE_ONLY} ${DATE_FORMATS.TIME_ONLY}`, { zone: APP_TIMEZONE });
    return dt.isValid ? dt : null;
};
/**
 * Formatea una DateTime para respuestas API (ISO en zona horaria de la aplicación)
 */
export const formatForAPI = (dateTime) => {
    if (!dateTime || !dateTime.isValid)
        return null;
    return dateTime.setZone(APP_TIMEZONE).toISO();
};
/**
 * Convierte un Date nativo de JavaScript a DateTime en zona horaria de la aplicación
 */
export const fromJSDate = (date) => {
    return DateTime.fromJSDate(date, { zone: APP_TIMEZONE });
};
/**
 * Convierte una DateTime a Date nativo de JavaScript
 */
export const toJSDate = (dateTime) => {
    return dateTime.toJSDate();
};
/**
 * Convierte una fecha DATEONLY de BD (string YYYY-MM-DD) a DateTime
 */
export const fromDateOnlyDB = (dateString) => {
    if (!dateString)
        return null;
    return parseDateOnly(dateString);
};
/**
 * Convierte una DateTime a string DATEONLY para BD (YYYY-MM-DD)
 */
export const toDateOnlyDB = (dateTime) => {
    if (!dateTime || !dateTime.isValid)
        return null;
    return toDateOnly(dateTime);
};
//# sourceMappingURL=utils.js.map