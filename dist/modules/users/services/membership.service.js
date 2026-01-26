import { Membership } from '../../../modules/users/models/membership.model.js';
import { User } from '../../../modules/users/models/user.model.js';
import { Organization } from '../../../modules/organizations/models/organization.model.js';
import { ForbiddenError, NotFoundError, ConflictError, ValidationError, } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
/**
 * Valida que el usuario tenga rol 'admin' en la organización especificada.
 * Verifica membresía activa con rol 'admin'.
 *
 * @param userId - ID del usuario a validar
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 */
export const assertIsAdmin = async (userId, organizationId) => {
    const membership = await Membership.findOne({
        where: {
            userId,
            organizationId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta organización', {
            organizationId,
            userId,
        });
    }
    if (membership.role !== 'admin') {
        throw new ForbiddenError('Solo los administradores pueden gestionar memberships', {
            organizationId,
            userId,
            currentRole: membership.role,
        });
    }
};
/**
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
 *
 * @param organizationId - ID de la organización
 * @param data - Datos de la membership (userId, role, status opcional)
 * @param inviterUserId - ID del usuario que invita (debe ser admin)
 * @returns Membership creada con relaciones User y Organization
 * @throws {ForbiddenError} Si el inviter no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe una membership para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario está eliminado (soft delete)
 */
export const inviteUserToOrganization = async (organizationId, data, inviterUserId) => {
    // Nota: La validación de rol admin se hace en el middleware requireAdmin
    // Validar que la organización existe
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
        throw new NotFoundError('Organización', { organizationId });
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
    // Validar que no existe ya una membership para ese usuario en esa organización
    const existingMembership = await Membership.findOne({
        where: {
            userId: data.userId,
            organizationId,
        },
    });
    if (existingMembership) {
        throw new ConflictError('El usuario ya tiene una membresía en esta organización', {
            userId: data.userId,
            organizationId,
            existingMembershipId: existingMembership.id,
            existingRole: existingMembership.role,
            existingStatus: existingMembership.status,
        });
    }
    // Crear la membership
    let membership;
    try {
        membership = await Membership.create({
            userId: data.userId,
            organizationId,
            role: data.role,
            status: data.status ?? 'activo',
        });
    }
    catch (error) {
        // Capturar error de constraint único (índice único en userId + organizationId)
        if (error instanceof Error &&
            'name' in error &&
            error.name === 'SequelizeUniqueConstraintError') {
            throw new ConflictError('El usuario ya tiene una membresía en esta organización', {
                userId: data.userId,
                organizationId,
            });
        }
        throw error;
    }
    // Cargar relaciones para retornar datos completos
    await membership.reload({
        include: [
            { model: User, as: 'User' },
            { model: Organization, as: 'Organization' },
        ],
    });
    logger.info({
        membershipId: membership.id,
        organizationId,
        userId: data.userId,
        role: data.role,
        status: membership.status,
        inviterUserId,
    }, 'Usuario invitado a organización exitosamente');
    return membership;
};
/**
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
 *
 * @param membershipId - ID de la membership a actualizar
 * @param organizationId - ID de la organización
 * @param data - Datos a actualizar (role y/o status opcionales)
 * @param updaterUserId - ID del usuario que actualiza (debe ser admin)
 * @returns Membership actualizada con relaciones User y Organization
 * @throws {ForbiddenError} Si el updater no es admin
 * @throws {NotFoundError} Si la membership no existe
 */
export const updateMembershipRole = async (membershipId, organizationId, data, updaterUserId) => {
    // Nota: La validación de rol admin se hace en el middleware requireAdmin
    // Buscar la membership por ID y organizationId
    const membership = await Membership.findOne({
        where: {
            id: membershipId,
            organizationId,
        },
    });
    if (!membership) {
        throw new NotFoundError('Membership', { membershipId, organizationId });
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
            { model: Organization, as: 'Organization' },
        ],
    });
    const updatedKeys = [
        data.role !== undefined && 'role',
        data.status !== undefined && 'status',
    ].filter(Boolean);
    logger.info({
        membershipId: membership.id,
        organizationId,
        userId: membership.userId,
        updatedFields: updatedKeys,
        updaterUserId,
    }, 'Membership actualizada exitosamente');
    return membership;
};
/**
 * Elimina una membership.
 * Solo los administradores pueden eliminar memberships.
 *
 * @param membershipId - ID de la membership a eliminar
 * @param organizationId - ID de la organización
 * @param deleterUserId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si el deleter no es admin
 * @throws {NotFoundError} Si la membership no existe
 */
export const deleteMembership = async (membershipId, organizationId, deleterUserId) => {
    // Nota: La validación de rol admin se hace en el middleware requireAdmin
    // Buscar la membership por ID y organizationId
    const membership = await Membership.findOne({
        where: {
            id: membershipId,
            organizationId,
        },
    });
    if (!membership) {
        throw new NotFoundError('Membership', { membershipId, organizationId });
    }
    // Guardar información para logging antes de eliminar
    const userId = membership.userId;
    // Eliminar la membership (hard delete, no hay soft delete en el modelo)
    await membership.destroy();
    logger.info({
        membershipId,
        organizationId,
        userId,
        deleterUserId,
    }, 'Membership eliminada exitosamente');
};
/**
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización (membership activa).
 *
 * @param organizationId - ID de la organización
 * @param filters - Filtros de paginación, ordenamiento y filtros (role, status)
 * @param userId - ID del usuario que solicita (debe tener acceso a la organización)
 * @returns Datos paginados de memberships con relaciones User y Organization
 * @throws {ForbiddenError} Si el usuario no tiene acceso a la organización
 */
export const listMemberships = async (organizationId, filters, userId) => {
    // Validar que el usuario tiene acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Construir query con filtros
    const where = {
        organizationId, // Multi-tenant obligatorio
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
            { model: Organization, as: 'Organization' },
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