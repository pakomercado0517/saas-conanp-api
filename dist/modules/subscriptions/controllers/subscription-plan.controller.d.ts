import type { Request, Response } from 'express';
/**
 * Crea un plan de suscripción.
 * Solo super administradores.
 *
 * POST /api/v1/subscription-plans
 */
export declare const createPlan: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista planes de suscripción con paginación y filtros.
 * Público o autenticado: no requiere autenticación.
 *
 * GET /api/v1/subscription-plans
 */
export declare const listPlans: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un plan por ID.
 * Público: no requiere autenticación.
 *
 * GET /api/v1/subscription-plans/:planId
 */
export declare const getPlanById: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un plan de suscripción.
 * Solo super administradores.
 *
 * PATCH /api/v1/subscription-plans/:planId
 */
export declare const updatePlan: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina un plan (soft delete).
 * Solo super administradores.
 *
 * DELETE /api/v1/subscription-plans/:planId
 */
export declare const deletePlan: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=subscription-plan.controller.d.ts.map