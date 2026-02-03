import { registry, generator, apiConfig } from './config.js';

/**
 * Exporta el registry para registrar schemas desde otros módulos
 */
export { registry };

/**
 * Exporta schemas comunes
 */
export * from './schemas.js';

// Importar loader DESPUÉS de exportar schemas para evitar circular dependencies
import './loader.js';

/**
 * Genera la especificación OpenAPI completa
 * @returns Objeto de especificación OpenAPI 3.0
 */
export const generateOpenAPISpec = (): unknown => {
  return generator.generateDocument(apiConfig);
};
