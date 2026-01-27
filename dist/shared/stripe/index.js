import Stripe from 'stripe';
import dotenv from 'dotenv';
import { ValidationError, BadRequestError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger/index.js';
dotenv.config();
/**
 * Valores por defecto para la configuración de Stripe
 */
const DEFAULT_CURRENCY = 'mxn';
const DEFAULT_REGION = 'mx';
const DEFAULT_API_VERSION = '2024-11-20.acacia';
/**
 * Validar que todas las variables de entorno requeridas estén configuradas
 */
const validateEnvironmentVariables = () => {
    const secretKey = process.env['STRIPE_SECRET_KEY'];
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    const publishableKey = process.env['STRIPE_PUBLISHABLE_KEY'];
    const currency = process.env['STRIPE_CURRENCY'] || DEFAULT_CURRENCY;
    const apiVersion = process.env['STRIPE_API_VERSION'];
    const region = process.env['STRIPE_REGION'] || DEFAULT_REGION;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno');
    }
    if (!secretKey.startsWith('sk_')) {
        throw new Error('STRIPE_SECRET_KEY no tiene un formato válido (debe comenzar con sk_)');
    }
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET no está definida en las variables de entorno');
    }
    if (!webhookSecret.startsWith('whsec_')) {
        throw new Error('STRIPE_WEBHOOK_SECRET no tiene un formato válido (debe comenzar con whsec_)');
    }
    return {
        secretKey,
        webhookSecret,
        ...(publishableKey && { publishableKey }),
        currency,
        ...(apiVersion && { apiVersion }),
        region,
    };
};
// Validar y obtener configuración
const config = validateEnvironmentVariables();
/**
 * Cliente de Stripe configurado con opciones por defecto
 *
 * Configuración:
 * - API Version: desde variable de entorno o versión por defecto
 * - TypeScript: habilitado para mejor tipado
 * - Reintentos de red: 2 intentos automáticos
 * - Timeout: 30 segundos
 */
const stripeClient = new Stripe(config.secretKey, {
    apiVersion: (config.apiVersion || DEFAULT_API_VERSION),
    typescript: true,
    maxNetworkRetries: 2,
    timeout: 30000,
});
logger.info({
    apiVersion: config.apiVersion || DEFAULT_API_VERSION,
    currency: config.currency,
    region: config.region,
}, 'Cliente de Stripe inicializado exitosamente');
/**
 * Maneja errores de Stripe y los convierte a errores personalizados del proyecto
 *
 * @param error - Error de Stripe o error de conexión
 * @returns Error personalizado del proyecto
 */
export const handleStripeError = (error) => {
    // Errores de Stripe
    if (error instanceof Stripe.errors.StripeError) {
        logger.error({
            error: {
                type: error.type,
                code: error.code,
                message: error.message,
                statusCode: error.statusCode,
            },
        }, 'Error de Stripe');
        // Mapear errores de Stripe a errores personalizados
        if (error instanceof Stripe.errors.StripeCardError) {
            throw new ValidationError(error.message || 'Error con la tarjeta de crédito', 'card', {
                code: error.code,
                declineCode: error.decline_code,
            });
        }
        if (error instanceof Stripe.errors.StripeRateLimitError) {
            throw new BadRequestError('Demasiadas solicitudes a Stripe. Por favor, intenta nuevamente en unos momentos.');
        }
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
            throw new ValidationError(error.message || 'Solicitud inválida a Stripe', undefined, {
                code: error.code,
                param: error.param,
            });
        }
        if (error instanceof Stripe.errors.StripeAPIError) {
            throw new BadRequestError('Error de conexión con el servicio de pagos. Por favor, intenta nuevamente más tarde.');
        }
        if (error instanceof Stripe.errors.StripeAuthenticationError) {
            throw new BadRequestError('Error de autenticación con Stripe');
        }
        if (error instanceof Stripe.errors.StripeConnectionError) {
            throw new BadRequestError('Error de conexión con Stripe. Verifica tu conexión a internet e intenta nuevamente.');
        }
        // Error genérico de Stripe
        throw new BadRequestError(error.message || 'Error al procesar la solicitud con Stripe');
    }
    // Errores de red o timeout
    if (error instanceof Error) {
        logger.error({
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        }, 'Error de conexión con Stripe');
        // Detectar errores de timeout o red
        if (error.message.includes('timeout') ||
            error.message.includes('ECONNRESET') ||
            error.message.includes('ENOTFOUND') ||
            error.message.includes('network')) {
            throw new BadRequestError('Error de conexión con Stripe. Verifica tu conexión a internet e intenta nuevamente.');
        }
        throw new BadRequestError(`Error inesperado: ${error.message || 'Error desconocido'}`);
    }
    // Error desconocido
    logger.error({ error }, 'Error desconocido de Stripe');
    throw new BadRequestError('Error desconocido al procesar la solicitud con Stripe');
};
/**
 * Prueba la conexión con Stripe haciendo una llamada simple a la API
 *
 * Útil para validar que la configuración es correcta al iniciar la aplicación.
 *
 * @throws {Error} Si la conexión falla
 */
export const testStripeConnection = async () => {
    try {
        await stripeClient.balance.retrieve();
        logger.info('Conexión con Stripe verificada exitosamente');
    }
    catch (error) {
        logger.error({
            error,
        }, 'Error al verificar conexión con Stripe');
        handleStripeError(error);
    }
};
/**
 * Obtiene la moneda por defecto configurada
 *
 * @returns Moneda por defecto (ej: 'mxn')
 */
export const getDefaultCurrency = () => {
    return config.currency;
};
/**
 * Obtiene la región por defecto configurada
 *
 * @returns Región por defecto (ej: 'mx')
 */
export const getDefaultRegion = () => {
    return config.region;
};
// Exportar configuración (solo lectura)
export const stripeConfig = config;
// Exportar cliente configurado
export { stripeClient };
//# sourceMappingURL=index.js.map