import type { Model, ModelStatic } from 'sequelize';
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
export declare const applyDateHooks: <T extends Model>(model: ModelStatic<T>, dateFields: DateFieldConfig[]) => void;
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
export declare const formatDateForResponse: (value: Date | string | null | undefined, type?: "datetime" | "dateonly") => string | null;
/**
 * Formatea un objeto o array de objetos con fechas para respuesta API
 *
 * Útil para formatear modelos completos antes de enviarlos al frontend.
 *
 * @param data - Objeto o array de objetos con fechas
 * @param dateFields - Configuración de campos de fecha a formatear
 * @returns Objeto o array formateado
 */
export declare const formatModelDatesForResponse: <T extends Record<string, unknown>>(data: T | T[], dateFields: DateFieldConfig[]) => T | T[];
export {};
//# sourceMappingURL=sequelize-hooks.d.ts.map