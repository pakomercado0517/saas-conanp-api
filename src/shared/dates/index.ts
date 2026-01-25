/**
 * Módulo centralizado para manejo de fechas con Luxon
 * 
 * Este módulo proporciona utilidades para:
 * - Conversión de zonas horarias (México <-> UTC)
 * - Validación de fechas
 * - Formateo de fechas para API
 * - Helpers para comparaciones y cálculos
 */

// Constantes
export { APP_TIMEZONE, DB_TIMEZONE, DATE_FORMATS } from './constants';

// Tipos
export type {
  DateOnly,
  TimeOnly,
  AppDateTime,
  UTCDateTime,
  FormatOptions,
} from './types';

// Utilidades de conversión
export {
  now,
  toUTC,
  fromUTC,
  toUTCString,
  fromUTCString,
  parseDate,
  toDateOnly,
  parseDateOnly,
  toTimeOnly,
  parseTimeOnly,
  formatForAPI,
  fromJSDate,
  toJSDate,
  fromDateOnlyDB,
  toDateOnlyDB,
} from './utils';

// Helpers de comparación y cálculos
export {
  isDateInPast,
  isDateInFuture,
  isDateInRange,
  daysBetween,
  addDays,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  endOfDay,
} from './helpers';

// Schemas Zod para validación
export {
  dateTimeSchema,
  dateOnlySchema,
  timeOnlySchema,
  dateRangeSchema,
  optionalDateTimeSchema,
  optionalDateOnlySchema,
  optionalTimeOnlySchema,
  futureDateSchema,
  pastDateSchema,
} from './zod-schemas';

// Hooks de Sequelize
export {
  applyDateHooks,
  formatDateForResponse,
  formatModelDatesForResponse,
} from './sequelize-hooks';

// Re-exportar DateTime de Luxon para uso directo cuando sea necesario
export { DateTime } from 'luxon';
