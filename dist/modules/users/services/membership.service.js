import { Membership } from '@/modules/users/models/membership.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { ForbiddenError, NotFoundError, ConflictError, ValidationError, } from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { checkUsersLimit } from '@/modules/subscriptions/services/subscription-limits.service.js';
/**
 * Valida que el usuario tenga rol 'admin' en la organización especificada.
 * Verifica membresía activa con rol 'admin'.
 *
 * @param userId - ID del usuario a validar
 * @param areaId - ID del área
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 */
export const assertIsAdmin = async (userId, areaId) => {
    const membership = await Membership.findOne({
        where: {
            userId,
            areaId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta área', {
            areaId,
            userId,
        });
    }
    if (membership.role !== 'admin') {
        throw new ForbiddenError('Solo los administradores pueden gestionar memberships', {
            areaId,
            userId,
            currentRole: membership.role,
        });
    }
};
/**
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
 *
 * @param areaId - ID del área
 * @param data - Datos de la membership (userId, role, status opcional)
 * @param inviterUserId - ID del usuario que invita (debe ser admin)
 * @returns Membership creada con relaciones User y Organization
 * @throws {ForbiddenError} Si el inviter no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe una membership para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario está eliminado (soft delete)
 */
export const inviteUserToOrganization = async (areaId, data, inviterUserId) => {
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    // Validar que el usuario a invitar existe y no está eliminado
    const userToInvite = await User.findByPk(data.userId);
    if (!userToInvite) {
        throw new NotFoundError('Usuario', { userId: data.userId });
    }
    // Verificar si el usuario está eliminado (soft delete)
    if (userToInvite.deletedAt) {
        throw new ValidationError('No se puede invitar un usuario que ha sido eliminado', undefined, {
            userId: data.userId,
        });
    }
    const existingMembership = await Membership.findOne({
        where: { userId: data.userId, areaId },
    });
    if (existingMembership) {
        throw new ConflictError('El usuario ya tiene una membresía en esta área', {
            userId: data.userId,
            areaId,
            existingMembershipId: existingMembership.id,
            existingRole: existingMembership.role,
            existingStatus: existingMembership.status,
        });
    }
    await checkUsersLimit(areaId);
    let membership;
    try {
        membership = await Membership.create({
            userId: data.userId,
            areaId,
            role: data.role,
            status: data.status ?? 'activo',
        });
    }
    catch (error) {
        if (error instanceof Error &&
            'name' in error &&
            error.name === 'SequelizeUniqueConstraintError') {
            throw new ConflictError('El usuario ya tiene una membresía en esta área', {
                userId: data.userId,
                areaId,
            });
        }
        throw error;
    }
    await membership.reload({
        include: [
            { model: User, as: 'User' },
            { model: Area, as: 'Area' },
        ],
    });
    logger.info({
        membershipId: membership.id,
        areaId,
        userId: data.userId,
        role: data.role,
        status: membership.status,
        inviterUserId,
    }, 'Usuario invitado a área exitosamente');
    return membership;
};
/**
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
 *
 * @param membershipId - ID de la membership a actualizar
 * @param areaId - ID del área
 * @param data - Datos a actualizar (role y/o status opcionales)
 * @param updaterUserId - ID del usuario que actualiza (debe ser admin)
 * @returns Membership actualizada con relaciones User y Organization
 * @throws {ForbiddenError} Si el updater no es admin
 * @throws {NotFoundError} Si la membership no existe
 */
export const updateMembershipRole = async (membershipId, areaId, data, updaterUserId) => {
    const membership = await Membership.findOne({
        where: { id: membershipId, areaId },
    });
    if (!membership) {
        throw new NotFoundError('Membership', { membershipId, areaId });
    }
    // Actualizar solo los campos proporcionados
    const updateData = {};
    if (data.role !== undefined) {
        updateData.role = data.role;
    }
    if (data.status !== undefined) {
        updateData.status = data.status;
    }
    await membership.update(updateData);
    // Cargar relaciones para retornar datos completos
    await membership.reload({
        include: [
            { model: User, as: 'User' },
            { model: Area, as: 'Area' },
        ],
    });
    const updatedKeys = [
        data.role !== undefined && 'role',
        data.status !== undefined && 'status',
    ].filter(Boolean);
    logger.info({
        membershipId: membership.id,
        areaId,
        userId: membership.userId,
        updatedFields: updatedKeys,
        updaterUserId,
    }, 'Membership actualizada exitosamente');
    return membership;
};
/**
 * Elimina una membership.
 */
export const deleteMembership = async (membershipId, areaId, deleterUserId) => {
    const membership = await Membership.findOne({
        where: { id: membershipId, areaId },
    });
    if (!membership) {
        throw new NotFoundError('Membership', { membershipId, areaId });
    }
    const userId = membership.userId;
    await membership.destroy();
    logger.info({ membershipId, areaId, userId, deleterUserId }, 'Membership eliminada exitosamente');
};
/**
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización (membership activa).
 *
 * @param areaId - ID del área
 * @param filters - Filtros de paginación, ordenamiento y filtros (role, status)
 * @param userId - ID del usuario que solicita (debe tener acceso a la organización)
 * @returns Datos paginados de memberships con relaciones User y Organization
 * @throws {ForbiddenError} Si el usuario no tiene acceso a la organización
 */
export const listMemberships = async (areaId, filters, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    const where = {
        areaId,
    };
    // Aplicar filtros opcionales
    if (filters.role) {
        where['role'] = filters.role;
    }
    if (filters.status) {
        where['status'] = filters.status;
    }
    // Configurar paginación
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;
    // Ejecutar query con paginación
    const result = await Membership.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            { model: User, as: 'User' },
            { model: Area, as: 'Area' },
        ],
    });
    const total = result.count;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page: filters.page,
        limit,
        total,
        totalPages,
    };
    return { data: result.rows, pagination };
};
//# sourceMappingURL=membership.service.js.map