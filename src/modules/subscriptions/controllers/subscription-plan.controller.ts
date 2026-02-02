import type { Request, Response } from 'express';
import * as subscriptionPlanService from '../services/subscription-plan.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateSubscriptionPlanDTO,
  UpdateSubscriptionPlanDTO,
  ListSubscriptionPlansDTO,
} from '../validators/subscription-plan.validator.js';

/**
 * Crea un plan de suscripción.
 * Solo super administradores.
 *
 * POST /api/v1/subscription-plans
 */
export const createPlan = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as CreateSubscriptionPlanDTO;
  const result = await subscriptionPlanService.createPlan(data);
  return sendCreated(res, result, 'Plan creado exitosamente');
};

/**
 * Lista planes de suscripción con paginación y filtros.
 * Público o autenticado: no requiere autenticación.
 *
 * GET /api/v1/subscription-plans
 */
export const listPlans = async (req: Request, res: Response): Promise<Response> => {
  const filters = req.validatedQuery as ListSubscriptionPlansDTO;
  const result = await subscriptionPlanService.listPlans(filters);
  return sendPaginated(res, result.data, result.pagination, 'Planes obtenidos exitosamente');
};

/**
 * Obtiene un plan por ID.
 * Público: no requiere autenticación.
 *
 * GET /api/v1/subscription-plans/:planId
 */
export const getPlanById = async (req: Request, res: Response): Promise<Response> => {
  const planId = req.params['planId'] as string;
  const plan = await subscriptionPlanService.getPlanById(planId);
  return sendSuccess(res, plan, 'Plan obtenido exitosamente');
};

/**
 * Actualiza un plan de suscripción.
 * Solo super administradores.
 *
 * PATCH /api/v1/subscription-plans/:planId
 */
export const updatePlan = async (req: Request, res: Response): Promise<Response> => {
  const planId = req.params['planId'] as string;
  const data = req.body as UpdateSubscriptionPlanDTO;
  const result = await subscriptionPlanService.updatePlan(planId, data);
  return sendSuccess(res, result, 'Plan actualizado exitosamente');
};

/**
 * Elimina un plan (soft delete).
 * Solo super administradores.
 *
 * DELETE /api/v1/subscription-plans/:planId
 */
export const deletePlan = async (req: Request, res: Response): Promise<Response> => {
  const planId = req.params['planId'] as string;
  await subscriptionPlanService.deletePlan(planId);
  return sendNoContent(res);
};
