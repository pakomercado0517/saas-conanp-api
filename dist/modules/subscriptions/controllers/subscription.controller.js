import * as subscriptionService from '../services/subscription.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/responses/helpers.js';
/**
 * Crea una suscripción para la organización.
 *
 * POST /api/v1/organizations/:organizationId/subscriptions
 *
 * Requiere autenticación y acceso a la organización.
 */
export const createSubscription = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const data = req.body;
    const subscription = await subscriptionService.createSubscription(data, organizationId, userId);
    return sendCreated(res, subscription, 'Suscripción creada exitosamente');
};
/**
 * Obtiene la suscripción actual de la organización.
 *
 * GET /api/v1/organizations/:organizationId/subscriptions/current
 *
 * Requiere autenticación y acceso a la organización.
 */
export const getCurrentSubscription = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const subscription = await subscriptionService.getSubscriptionByOrganization(organizationId, userId);
    if (!subscription) {
        return sendSuccess(res, null, 'La organización no tiene suscripción activa');
    }
    return sendSuccess(res, subscription, 'Suscripción obtenida exitosamente');
};
/**
 * Cambia el plan de una suscripción (upgrade/downgrade).
 *
 * PATCH /api/v1/subscriptions/:subscriptionId/plan
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export const changePlan = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const subscriptionId = req.params['subscriptionId'];
    const userId = req.user.userId;
    const data = req.body;
    const subscription = await subscriptionService.getSubscriptionById(subscriptionId, userId);
    const result = await subscriptionService.changePlan(subscriptionId, subscription.organizationId, userId, data);
    return sendSuccess(res, result, 'Plan actualizado exitosamente');
};
/**
 * Cancela una suscripción.
 *
 * POST /api/v1/subscriptions/:subscriptionId/cancel
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export const cancelSubscription = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const subscriptionId = req.params['subscriptionId'];
    const userId = req.user.userId;
    const data = req.body;
    const subscription = await subscriptionService.getSubscriptionById(subscriptionId, userId);
    const result = await subscriptionService.cancelSubscription(subscriptionId, subscription.organizationId, userId, data);
    return sendSuccess(res, result, 'Suscripción cancelada exitosamente');
};
/**
 * Reactiva una suscripción programada para cancelarse al final del período.
 *
 * POST /api/v1/subscriptions/:subscriptionId/reactivate
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export const reactivateSubscription = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const subscriptionId = req.params['subscriptionId'];
    const userId = req.user.userId;
    const subscription = await subscriptionService.getSubscriptionById(subscriptionId, userId);
    const result = await subscriptionService.reactivateSubscription(subscriptionId, subscription.organizationId, userId);
    return sendSuccess(res, result, 'Suscripción reactivada exitosamente');
};
/**
 * Obtiene el historial de facturación (invoices) de una suscripción.
 *
 * GET /api/v1/subscriptions/:subscriptionId/invoices
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 */
export const getBillingHistory = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const subscriptionId = req.params['subscriptionId'];
    const userId = req.user.userId;
    const page = Math.max(1, Number(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));
    const result = await subscriptionService.getBillingHistory(subscriptionId, userId, page, limit);
    return sendPaginated(res, result.data, result.pagination, 'Historial de facturación obtenido exitosamente');
};
//# sourceMappingURL=subscription.controller.js.map