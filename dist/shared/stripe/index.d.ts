import Stripe from 'stripe';
import type { StripeConfig } from './types.js';
/**
 * Cliente de Stripe configurado con opciones por defecto
 *
 * Configuración:
 * - API Version: desde variable de entorno o versión por defecto
 * - TypeScript: habilitado para mejor tipado
 * - Reintentos de red: 2 intentos automáticos
 * - Timeout: 30 segundos
 */
declare const stripeClient: Stripe;
/**
 * Maneja errores de Stripe y los convierte a errores personalizados del proyecto
 *
 * @param error - Error de Stripe o error de conexión
 * @returns Error personalizado del proyecto
 */
export declare const handleStripeError: (error: unknown) => never;
/**
 * Prueba la conexión con Stripe haciendo una llamada simple a la API
 *
 * Útil para validar que la configuración es correcta al iniciar la aplicación.
 *
 * @throws {Error} Si la conexión falla
 */
export declare const testStripeConnection: () => Promise<void>;
/**
 * Obtiene la moneda por defecto configurada
 *
 * @returns Moneda por defecto (ej: 'mxn')
 */
export declare const getDefaultCurrency: () => string;
/**
 * Obtiene la región por defecto configurada
 *
 * @returns Región por defecto (ej: 'mx')
 */
export declare const getDefaultRegion: () => string;
export declare const stripeConfig: Readonly<StripeConfig>;
export { stripeClient };
//# sourceMappingURL=index.d.ts.map