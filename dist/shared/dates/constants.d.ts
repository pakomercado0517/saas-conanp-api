/**
 * Constantes para manejo de fechas y zonas horarias
 */
/**
 * Zona horaria de la aplicación (México)
 */
export declare const APP_TIMEZONE: "America/Mexico_City";
/**
 * Zona horaria de la base de datos (UTC)
 */
export declare const DB_TIMEZONE: "utc";
/**
 * Formatos de fecha comunes
 */
export declare const DATE_FORMATS: {
    /** Formato ISO completo con zona horaria */
    readonly ISO_FULL: "yyyy-MM-dd'T'HH:mm:ss.SSSZZ";
    /** Formato ISO sin milisegundos */
    readonly ISO: "yyyy-MM-dd'T'HH:mm:ssZZ";
    /** Solo fecha YYYY-MM-DD */
    readonly DATE_ONLY: "yyyy-MM-dd";
    /** Solo hora HH:mm:ss */
    readonly TIME_ONLY: "HH:mm:ss";
    /** Hora corta HH:mm */
    readonly TIME_SHORT: "HH:mm";
    /** Para respuestas API */
    readonly API: "yyyy-MM-dd'T'HH:mm:ssZZ";
};
//# sourceMappingURL=constants.d.ts.map