import { DateTime } from 'luxon';
import type { Model, ModelStatic } from 'sequelize';
import { APP_TIMEZONE } from './constants';
import { parseDateOnly, toDateOnly } from './utils';

/**
 * Configuración de campos de fecha que deben convertirse automáticamente
 */
interface DateFieldConfig {
  /** Nombre del campo en el modelo */
  field: string;
  /** Tipo de campo: 'datetime' para DATE, 'dateonly' para DATEONLY */
  type: 'datetime' | 'dateonly';
}

/**
 * Aplica hooks de Sequelize para convertir fechas a UTC antes de guardar
 *
 * Nota: Los campos DATE se almacenan en UTC en la BD.
 * Para formatear fechas en respuestas API, usar formatDateForResponse() en servicios/controladores.
 *
 * @param model - Modelo de Sequelize
 * @param dateFields - Array de campos de fecha a convertir
 */
export const applyDateHooks = <T extends Model>(
  model: ModelStatic<T>,
  dateFields: DateFieldConfig[]
): void => {
  // Hook antes de crear: convertir a UTC
  model.addHook('beforeCreate', (instance: T) => {
    for (const { field, type } of dateFields) {
      const value = instance.getDataValue(field);
      if (value === null || value === undefined) continue;

      if (type === 'datetime') {
        // Para campos DATE: convertir a UTC antes de guardar
        if (value instanceof Date) {
          // Si ya es Date, asumimos que viene en zona horaria de México y convertimos a UTC
          const dt = DateTime.fromJSDate(value, { zone: APP_TIMEZONE });
          if (dt.isValid) {
            instance.setDataValue(field, dt.toUTC().toJSDate());
          }
        } else if (typeof value === 'string') {
          // Si es string ISO, parsear y convertir a UTC
          const dt = DateTime.fromISO(value, { zone: APP_TIMEZONE });
          if (dt.isValid) {
            instance.setDataValue(field, dt.toUTC().toJSDate());
          }
        }
      } else if (type === 'dateonly') {
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
  model.addHook('beforeUpdate', (instance: T) => {
    for (const { field, type } of dateFields) {
      const value = instance.getDataValue(field);
      if (value === null || value === undefined) continue;

      if (type === 'datetime') {
        if (value instanceof Date) {
          const dt = DateTime.fromJSDate(value, { zone: APP_TIMEZONE });
          if (dt.isValid) {
            instance.setDataValue(field, dt.toUTC().toJSDate());
          }
        } else if (typeof value === 'string') {
          const dt = DateTime.fromISO(value, { zone: APP_TIMEZONE });
          if (dt.isValid) {
            instance.setDataValue(field, dt.toUTC().toJSDate());
          }
        }
      } else if (type === 'dateonly') {
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
export const formatDateForResponse = (
  value: Date | string | null | undefined,
  type: 'datetime' | 'dateonly' = 'datetime'
): string | null => {
  if (value === null || value === undefined) return null;

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
  } else if (type === 'dateonly') {
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
export const formatModelDatesForResponse = <T extends Record<string, unknown>>(
  data: T | T[],
  dateFields: DateFieldConfig[]
): T | T[] => {
  const formatObject = (obj: T): T => {
    const formatted = { ...obj } as T;

    for (const { field, type } of dateFields) {
      if (field in formatted) {
        const formattedValue = formatDateForResponse(
          formatted[field] as Date | string | null | undefined,
          type
        );
        if (formattedValue !== null) {
          (formatted as Record<string, unknown>)[field] = formattedValue;
        }
      }
    }

    return formatted;
  };

  if (Array.isArray(data)) {
    return data.map(formatObject) as T[];
  }

  return formatObject(data);
};
