import type { Request, Response } from 'express';
/**
 * Crea una suscripción para la organización.
 *
 * POST /api/v1/organizations/:organizationId/subscriptions
 *
 * Requiere autenticación y acceso a la organización.
 */
export declare const createSubscription: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene la suscripción actual de la organización.
 *
 * GET /api/v1/organizations/:organizationId/subscriptions/current
 *
 * Requiere autenticación y acceso a la organización.
 */
export declare const getCurrentSubscription: (req: Request, res: Response) => Promise<Response>;
/**
 * Cambia el plan de una suscripción (upgrade/downgrade).
 *
 * PATCH /api/v1/subscriptions/:subscriptionId/plan
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export declare const changePlan: (req: Request, res: Response) => Promise<Response>;
/**
 * Cancela una suscripción.
 *
 * POST /api/v1/subscriptions/:subscriptionId/cancel
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export declare const cancelSubscription: (req: Request, res: Response) => Promise<Response>;
/**
 * Reactiva una suscripción programada para cancelarse al final del período.
 *
 * POST /api/v1/subscriptions/:subscriptionId/reactivate
 *
 * Requiere autenticación. Valida que el usuario tenga acceso a la organización de la suscripción.
 */
export declare const reactivateSubscription: (req: Request, res: Response) => Promise<Response>;
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
export declare const getBillingHistory: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=subscription.controller.d.ts.map