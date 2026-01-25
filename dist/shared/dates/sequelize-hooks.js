import { DateTime } from 'luxon';
import { APP_TIMEZONE } from './constants';
import { parseDateOnly, toDateOnly } from './utils';
/**
 * Aplica hooks de Sequelize para convertir fechas a UTC antes de guardar
 *
 * Nota: Los campos DATE se almacenan en UTC en la BD.
 * Para formatear fechas en respuestas API, usar formatDateForResponse() en servicios/controladores.
 *
 * @param model - Modelo de Sequelize
 * @param dateFields - Array de campos de fecha a convertir
 */
export const applyDateHooks = (model, dateFields) => {
    // Hook antes de crear: convertir a UTC
    model.addHook('beforeCreate', (instance) => {
        for (const { field, type } of dateFields) {
            const value = instance.getDataValue(field);
            if (value === null || value === undefined)
                continue;
            if (type === 'datetime') {
                // Para campos DATE: convertir a UTC antes de guardar
                if (value instanceof Date) {
                    // Si ya es Date, asumimos que viene en zona horaria de México y convertimos a UTC
                    const dt = DateTime.fromJSDate(value, { zone: APP_TIMEZONE });
                    if (dt.isValid) {
                        instance.setDataValue(field, dt.toUTC().toJSDate());
                    }
                }
                else if (typeof value === 'string') {
                    // Si es string ISO, parsear y convertir a UTC
                    const dt = DateTime.fromISO(value, { zone: APP_TIMEZONE });
                    if (dt.isValid) {
                        instance.setDataValue(field, dt.toUTC().toJSDate());
                    }
                }
            }
            else if (type === 'dateonly') {
                // Para campos DATEONLY: validar formato YYYY-MM-DD
                // No necesita conversión de zona horaria, solo validación
                if (typeof value === 'string') {
                    const dt = parseDateOnly(value);
                    if (dt && dt.isValid) {
                        instance.setDataValue(field, toDateOnly(dt));
                    }
                }
            }
        }
    });
    // Hook antes de actualizar: convertir a UTC
    model.addHook('beforeUpdate', (instance) => {
        for (const { field, type } of dateFields) {
            const value = instance.getDataValue(field);
            if (value === null || value === undefined)
                continue;
            if (type === 'datetime') {
                if (value instanceof Date) {
                    const dt = DateTime.fromJSDate(value, { zone: APP_TIMEZONE });
                    if (dt.isValid) {
                        instance.setDataValue(field, dt.toUTC().toJSDate());
                    }
                }
                else if (typeof value === 'string') {
                    const dt = DateTime.fromISO(value, { zone: APP_TIMEZONE });
                    if (dt.isValid) {
                        instance.setDataValue(field, dt.toUTC().toJSDate());
                    }
                }
            }
            else if (type === 'dateonly') {
                if (typeof value === 'string') {
                    const dt = parseDateOnly(value);
                    if (dt && dt.isValid) {
                        instance.setDataValue(field, toDateOnly(dt));
                    }
                }
            }
        }
    });
};
/**
 * Convierte un valor de fecha al formatear para respuesta JSON
 *
 * Usar este helper en servicios o controladores para formatear fechas
 * antes de enviar respuestas al frontend.
 *
 * @param value - Valor de fecha (Date, string ISO, o null)
 * @param type - Tipo de campo: 'datetime' o 'dateonly'
 * @returns String ISO en zona horaria de México o null
 */
export const formatDateForResponse = (value, type = 'datetime') => {
    if (value === null || value === undefined)
        return null;
    if (type === 'datetime') {
        if (value instanceof Date) {
            // Date de Sequelize viene en UTC, convertir a zona horaria de México
            const dt = DateTime.fromJSDate(value, { zone: 'utc' });
            if (dt.isValid) {
                return dt.setZone(APP_TIMEZONE).toISO();
            }
        }
        if (typeof value === 'string') {
            // Si es string, asumir que viene en UTC y convertir
            const dt = DateTime.fromISO(value, { zone: 'utc' });
            if (dt.isValid) {
                return dt.setZone(APP_TIMEZONE).toISO();
            }
        }
    }
    else if (type === 'dateonly') {
        // DATEONLY ya está en formato YYYY-MM-DD, solo retornarlo
        return typeof value === 'string' ? value : null;
    }
    return null;
};
/**
 * Formatea un objeto o array de objetos con fechas para respuesta API
 *
 * Útil para formatear modelos completos antes de enviarlos al frontend.
 *
 * @param data - Objeto o array de objetos con fechas
 * @param dateFields - Configuración de campos de fecha a formatear
 * @returns Objeto o array formateado
 */
export const formatModelDatesForResponse = (data, dateFields) => {
    const formatObject = (obj) => {
        const formatted = { ...obj };
        for (const { field, type } of dateFields) {
            if (field in formatted) {
                const formattedValue = formatDateForResponse(formatted[field], type);
                if (formattedValue !== null) {
                    formatted[field] = formattedValue;
                }
            }
        }
        return formatted;
    };
    if (Array.isArray(data)) {
        return data.map(formatObject);
    }
    return formatObject(data);
};
//# sourceMappingURL=sequelize-hooks.js.map