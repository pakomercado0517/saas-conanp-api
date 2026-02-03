import { registry } from './config.js';
/**
 * Exporta el registry para registrar schemas desde otros módulos
 */
export { registry };
/**
 * Exporta schemas comunes
 */
export * from './schemas.js';
/**
 * Importar loader para registrar todos los paths de módulos
 * IMPORTANTE: Debe importarse ANTES de la función generateOpenAPISpec
 */
import './loader.js';
/**
 * Genera la especificación OpenAPI completa
 * El generator se crea AQUÍ para asegurar que capture todas las definiciones
 * registradas por los módulos importados por el loader
 * @returns Objeto de especificación OpenAPI 3.0
 */
export declare const generateOpenAPISpec: () => unknown;
//# sourceMappingURL=index.d.ts.map