import type { Request, Response } from 'express';
/**
 * Obtiene el perfil del usuario autenticado
 *
 * GET /api/v1/users/profile
 */
export declare const getProfile: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza el perfil del usuario autenticado
 *
 * PATCH /api/v1/users/profile
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<Response>;
/**
 * Cambia la contraseña del usuario autenticado
 *
 * PATCH /api/v1/users/password
 */
export declare const changePassword: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina el usuario autenticado (soft delete)
 *
 * DELETE /api/v1/users/profile
 */
export declare const deleteUser: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=user.controller.d.ts.map