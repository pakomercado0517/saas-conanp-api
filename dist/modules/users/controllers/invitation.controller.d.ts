import type { Request, Response } from 'express';
/**
 * POST /api/v1/organizations/:organizationId/invitations
 */
export declare const createInvitation: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/invitations
 */
export declare const listInvitations: (req: Request, res: Response) => Promise<Response>;
/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/revoke
 */
export declare const revokeInvitation: (req: Request, res: Response) => Promise<Response>;
/**
 * POST /api/v1/invitations/validate
 * Público: valida token para mostrar formulario de registro en frontend.
 */
export declare const validateInvitationToken: (req: Request, res: Response) => Promise<Response>;
/**
 * POST /api/v1/invitations/verify-email/start
 * Público: inicia verificación de email para flujo código manual; envía OTP por correo.
 */
export declare const startVerifyEmail: (req: Request, res: Response) => Promise<Response>;
/**
 * POST /api/v1/invitations/verify-email/confirm
 * Público: confirma OTP y devuelve invitationProof para usar en registro.
 */
export declare const confirmVerifyEmail: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=invitation.controller.d.ts.map