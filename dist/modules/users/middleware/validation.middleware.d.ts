import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para actualizar perfil de usuario
 *
 * Valida el body de la request usando UpdateProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateProfile: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para cambiar contraseña
 *
 * Valida el body de la request usando ChangePasswordSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateChangePassword: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para crear/invitar membership
 *
 * Valida el body de la request usando CreateMembershipSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreateMembership: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar membership
 *
 * Valida el body de la request usando UpdateMembershipSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateMembership: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar memberships
 *
 * Valida los query params usando ListMembershipsSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListMemberships: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateCreateInvitation: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateListInvitations: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateInvitationToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateStartVerifyEmail: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateConfirmVerifyEmail: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map