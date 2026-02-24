import { Router } from 'express';
import { createPlan, listPlans, getPlanById, updatePlan, deletePlan, } from '../controllers/subscription-plan.controller.js';
import { validateCreateSubscriptionPlan, validateUpdateSubscriptionPlan, validateListSubscriptionPlans, } from '../middleware/validation.middleware.js';
import { authenticate, requireSuperAdmin } from '../../../shared/middleware/index.js';
/**
 * Router de planes de suscripción
 *
 * Todas las rutas están bajo el prefijo /api/v1/subscription-plans
 */
const subscriptionPlanRouter = Router();
/**
 * POST /api/v1/subscription-plans
 * Crea un plan de suscripción.
 * Solo super administradores.
 */
subscriptionPlanRouter.post('/', authenticate, requireSuperAdmin, validateCreateSubscriptionPlan, createPlan);
/**
 * GET /api/v1/subscription-plans
 * Lista planes con paginación y filtros.
 * Público o autenticado: no requiere autenticación.
 */
subscriptionPlanRouter.get('/', validateListSubscriptionPlans, listPlans);
/**
 * GET /api/v1/subscription-plans/:planId
 * Obtiene un plan por ID.
 * Público: no requiere autenticación.
 */
subscriptionPlanRouter.get('/:planId', getPlanById);
/**
 * PATCH /api/v1/subscription-plans/:planId
 * Actualiza un plan.
 * Solo super administradores.
 */
subscriptionPlanRouter.patch('/:planId', authenticate, requireSuperAdmin, validateUpdateSubscriptionPlan, updatePlan);
/**
 * DELETE /api/v1/subscription-plans/:planId
 * Elimina un plan (soft delete).
 * Solo super administradores.
 */
subscriptionPlanRouter.delete('/:planId', authenticate, requireSuperAdmin, deletePlan);
export default subscriptionPlanRouter;
//# sourceMappingURL=subscription-plan.routes.js.map