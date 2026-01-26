import type { UpdateProfileDTO, ChangePasswordDTO } from '../validators/user.validator.js';
import type { UUID } from '../../../shared/database/types.js';
/**
 * Perfil de usuario sin información sensible
 */
export interface UserProfile {
    id: UUID;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Obtiene el perfil del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @returns Perfil del usuario sin password
 * @throws {NotFoundError} Si el usuario no existe
 */
export declare const getUserProfile: (userId: UUID) => Promise<UserProfile>;
/**
 * Actualiza el perfil del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @param data - Datos a actualizar (email y/o name)
 * @returns Perfil del usuario actualizado sin password
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {ConflictError} Si el email ya está en uso por otro usuario
 */
export declare const updateProfile: (userId: UUID, data: UpdateProfileDTO) => Promise<UserProfile>;
/**
 * Cambia la contraseña del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @param data - Datos de cambio de contraseña (currentPassword, newPassword)
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {UnauthorizedError} Si la contraseña actual es incorrecta
 */
export declare const changePassword: (userId: UUID, data: ChangePasswordDTO) => Promise<void>;
/**
 * Elimina el usuario autenticado (soft delete)
 *
 * Realiza las siguientes acciones:
 * 1. Verifica que el usuario existe
 * 2. Valida que no tenga membresías activas
 * 3. Revoca todos los refresh tokens
 * 4. Anonimiza datos personales (email y name) para mantener unicidad
 * 5. Realiza soft delete del usuario
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {ValidationError} Si el usuario tiene membresías activas
 */
export declare const deleteUser: (userId: UUID) => Promise<void>;
//# sourceMappingURL=user.service.d.ts.map