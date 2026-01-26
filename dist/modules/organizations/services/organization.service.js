import { Op } from 'sequelize';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Membership } from '../../../modules/users/models/membership.model';
import { ForbiddenError, NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
export const assertCanAccessOrganization = async (userId, organizationId) => {
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
};
/**
 * Crea una nueva organización.
 * No requiere validación de acceso (no hay organización previa).
 */
export const createOrganization = async (data) => {
    const org = await Organization.create({
        name: data.name,
        ecosystem_type: data.ecosystem_type,
        settings: data.settings ?? {},
    });
    logger.info({ organizationId: org.id, name: org.name, ecosystem_type: org.ecosystem_type }, 'Organización creada');
    return org;
};
/**
 * Obtiene una organización por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 */
export const getOrganizationById = async (organizationId, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    return org;
};
/**
 * Lista organizaciones con paginación y filtros.
 * Filtro multi-tenant obligatorio: solo organizaciones donde el usuario tiene membresía activa.
 */
export const listOrganizations = async (filters, userId) => {
    const memberships = await Membership.findAll({
        where: { userId, status: 'activo' },
        attributes: ['organizationId'],
    });
    const organizationIds = memberships.map((m) => m.organizationId);
    const limit = filters.limit;
    let total = 0;
    let rows = [];
    if (organizationIds.length === 0) {
        total = 0;
    }
    else {
        const where = {
            id: { [Op.in]: organizationIds },
        };
        if (filters.name) {
            where['name'] = { [Op.iLike]: `%${filters.name}%` };
        }
        if (filters.ecosystem_type) {
            where['ecosystem_type'] = filters.ecosystem_type;
        }
        const sortBy = filters.sortBy ?? 'createdAt';
        const sortOrder = filters.sortOrder ?? 'desc';
        const offset = (filters.page - 1) * limit;
        const result = await Organization.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
        });
        rows = result.rows;
        total = result.count;
    }
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page: filters.page,
        limit,
        total,
        totalPages,
    };
    return { data: rows, pagination };
};
/**
 * Actualiza una organización.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 */
export const updateOrganization = async (organizationId, data, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    await org.update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ecosystem_type !== undefined && { ecosystem_type: data.ecosystem_type }),
        ...(data.settings !== undefined && { settings: data.settings }),
    });
    const updatedKeys = [
        data.name !== undefined && 'name',
        data.ecosystem_type !== undefined && 'ecosystem_type',
        data.settings !== undefined && 'settings',
    ].filter(Boolean);
    logger.info({ organizationId: org.id, userId, updates: updatedKeys }, 'Organización actualizada');
    return org;
};
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 */
export const deleteOrganization = async (organizationId, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    await org.destroy();
    logger.info({ organizationId, userId }, 'Organización eliminada (soft delete)');
};
//# sourceMappingURL=organization.service.js.map