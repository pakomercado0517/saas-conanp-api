import { Router } from 'express';
import { getProfile, updateProfile, changePassword, deleteUser, } from '../controllers/user.controller.js';
import { validateUpdateProfile, validateChangePassword, } from '../middleware/validation.middleware.js';
import { authenticate } from '../../../shared/middleware/index.js';
/**
 * Router de usuarios
 *
 * Todas las rutas están bajo el prefijo /api/v1/users
 */
const userRouter = Router();
/**
 * GET /api/v1/users/profile
 * Obtiene el perfil del usuario autenticado
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     email: string,
 *     name: string,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: "Perfil obtenido exitosamente"
 * }
 */
userRouter.get('/profile', authenticate, getProfile);
/**
 * PATCH /api/v1/users/profile
 * Actualiza el perfil del usuario autenticado
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Body (al menos uno requerido):
 * - email: string (email válido, opcional)
 * - name: string (1-255 caracteres, opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     email: string,
 *     name: string,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: "Perfil actualizado exitosamente"
 * }
 */
userRouter.patch('/profile', authenticate, validateUpdateProfile, updateProfile);
/**
 * PATCH /api/v1/users/password
 * Cambia la contraseña del usuario autenticado
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Body:
 * - currentPassword: string (no vacío)
 * - newPassword: string (mínimo 8 caracteres, máximo 255)
 *
 * Respuesta 204: No Content
 */
userRouter.patch('/password', authenticate, validateChangePassword, changePassword);
/**
 * DELETE /api/v1/users/profile
 * Elimina el usuario autenticado (soft delete)
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Validaciones:
 * - El usuario no debe tener membresías activas en organizaciones
 * - Si tiene membresías activas, se debe contactar a los administradores primero
 *
 * Acciones realizadas:
 * - Revoca todos los refresh tokens del usuario
 * - Anonimiza datos personales (email y name)
 * - Realiza soft delete del usuario
 *
 * Respuesta 204: No Content
 */
userRouter.delete('/profile', authenticate, deleteUser);
export default userRouter;
//# sourceMappingURL=user.routes.js.map