import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para reporte de eventos por actividad
 *
 * Valida los query params de la request usando ReporteEventosPorActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateReporteEventosPorActividad: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reporte de eventos por prestador
 */
export declare const validateReporteEventosPorPrestador: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reporte de eventos por fecha
 */
export declare const validateReporteEventosPorFecha: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reporte de capacidad utilizada
 */
export declare const validateReporteCapacidadUtilizada: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reporte de prestadores activos
 */
export declare const validateReportePrestadoresActivos: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateReporteStockActual: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateReporteSalidasStock: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateReporteVentasPrestadores: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateReporteVentasPorProducto: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map