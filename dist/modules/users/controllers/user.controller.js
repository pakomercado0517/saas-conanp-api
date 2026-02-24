import * as userService from '../services/user.service.js';
import { sendSuccess, sendNoContent } from '../../../shared/responses/helpers.js';
/**
 * Obtiene el perfil del usuario autenticado
 *
 * GET /api/v1/users/profile
 */
export const getProfile = async (req, res) => {
    // El token ya fue validado por el middleware de autenticación
    // req.user contiene el payload del JWT (userId, email)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    const profile = await userService.getUserProfile(userId);
    return sendSuccess(res, profile, 'Perfil obtenido exitosamente');
};
/**
 * Actualiza el perfil del usuario autenticado
 *
 * PATCH /api/v1/users/profile
 */
export const updateProfile = async (req, res) => {
    // El token ya fue validado por el middleware de autenticación
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    const data = req.body;
    const updatedProfile = await userService.updateProfile(userId, data);
    return sendSuccess(res, updatedProfile, 'Perfil actualizado exitosamente');
};
/**
 * Cambia la contraseña del usuario autenticado
 *
 * PATCH /api/v1/users/password
 */
export const changePassword = async (req, res) => {
    // El token ya fue validado por el middleware de autenticación
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    const data = req.body;
    await userService.changePassword(userId, data);
    return sendNoContent(res);
};
/**
 * Elimina el usuario autenticado (soft delete)
 *
 * DELETE /api/v1/users/profile
 */
export const deleteUser = async (req, res) => {
    // El token ya fue validado por el middleware de autenticación
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const userId = req.user.userId;
    await userService.deleteUser(userId);
    return sendNoContent(res);
};
//# sourceMappingURL=user.controller.js.map