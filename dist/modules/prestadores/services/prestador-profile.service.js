import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { Membership } from '../../../modules/users/models/membership.model.js';
import { User } from '../../../modules/users/models/user.model.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { ForbiddenError, NotFoundError, ConflictError, ValidationError, } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { checkActivosLimit, checkPrestadoresLimit, } from '../../../modules/subscriptions/services/subscription-limits.service.js';
import { Activo } from '../../../modules/activos/models/activo.model.js';
import { sequelize } from '../../../shared/database/index.js';
import bcrypt from 'bcrypt';
/**
 * Valida que el usuario tenga una membership activa en la organización.
 *
 * @param userId - ID del usuario a validar
 * @param organizationId - ID de la organización
 * @returns Membership encontrada
 * @throws {ForbiddenError} Si no tiene membership activa en la organización
 */
export const validateUserMembership = async (userId, organizationId) => {
    const membership = await Membership.findOne({
        where: {
            userId,
            areaId: organizationId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes una membresía activa en esta organización', {
            organizationId,
            userId,
        });
    }
    return membership;
};
/**
 * Valida los permisos para acceder a un perfil de prestador.
 * - Los administradores pueden ver/editar cualquier perfil
 * - Los prestadores solo pueden ver/editar su propio perfil
 *
 * @param requestingUserId - ID del usuario que solicita acceso
 * @param profileUserId - ID del usuario del perfil de prestador
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene permisos para acceder al perfil
 */
export const validatePrestadorPermissions = async (requestingUserId, profileUserId, organizationId) => {
    // Si es el mismo usuario, permitir acceso
    if (requestingUserId === profileUserId) {
        return;
    }
    // Validar membership del usuario que solicita
    const membership = await validateUserMembership(requestingUserId, organizationId);
    // Solo los administradores pueden acceder a perfiles de otros usuarios
    if (membership.role !== 'admin') {
        throw new ForbiddenError('Solo puedes ver y editar tu propio perfil de prestador. Los administradores pueden gestionar todos los perfiles.', {
            organizationId,
            requestingUserId,
            profileUserId,
            currentRole: membership.role,
        });
    }
};
/**
 * Crea un nuevo perfil de prestador.
 * Requiere que el usuario tenga membership activa en la organización.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * @param data - Datos del perfil de prestador
 * @param creatorUserId - ID del usuario que crea (debe tener membership activa)
 * @returns PrestadorProfile creado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe un perfil para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario no tiene membership activa
 */
export const createPrestadorProfile = async (data, creatorUserId) => {
    // Validar que el creador tenga acceso a la organización
    await assertCanAccessOrganization(creatorUserId, data.organizationId);
    // Validar que el creador sea admin (solo admins pueden crear perfiles)
    const creatorMembership = await validateUserMembership(creatorUserId, data.organizationId);
    if (creatorMembership.role !== 'admin') {
        throw new ForbiddenError('Solo los administradores pueden crear perfiles de prestador', {
            organizationId: data.organizationId,
            userId: creatorUserId,
            currentRole: creatorMembership.role,
        });
    }
    await checkPrestadoresLimit(data.organizationId);
    await validateUserMembership(data.userId, data.organizationId);
    const area = await Area.findByPk(data.organizationId);
    if (!area) {
        throw new NotFoundError('Área', { organizationId: data.organizationId });
    }
    const dependenciaId = area.dependenciaId;
    // Validar que el usuario existe
    const user = await User.findByPk(data.userId);
    if (!user) {
        throw new NotFoundError('Usuario', { userId: data.userId });
    }
    const existingProfile = await PrestadorProfile.findOne({
        where: { userId: data.userId, dependenciaId },
    });
    if (existingProfile) {
        throw new ConflictError('El usuario ya tiene un perfil de prestador en esta dependencia', {
            userId: data.userId,
            organizationId: data.organizationId,
            existingProfileId: existingProfile.id,
        });
    }
    // Convertir permitExpiresAt de DateTime a Date si está presente
    let permitExpiresAtDate = undefined;
    if (data['permitExpiresAt'] !== undefined) {
        if (data['permitExpiresAt'] &&
            typeof data['permitExpiresAt'] === 'object' &&
            'toJSDate' in data['permitExpiresAt']) {
            permitExpiresAtDate = data['permitExpiresAt'].toJSDate();
        }
        else if (data['permitExpiresAt'] === null) {
            permitExpiresAtDate = null;
        }
    }
    let profile;
    try {
        const createData = {
            userId: data.userId,
            dependenciaId,
            status: data.status ?? 'activo',
        };
        if (permitExpiresAtDate !== undefined) {
            createData.permitExpiresAt = permitExpiresAtDate;
        }
        profile = await PrestadorProfile.create(createData);
    }
    catch (error) {
        if (error instanceof Error &&
            'name' in error &&
            error.name === 'SequelizeUniqueConstraintError') {
            throw new ConflictError('El usuario ya tiene un perfil de prestador en esta dependencia', {
                userId: data.userId,
                organizationId: data.organizationId,
            });
        }
        throw error;
    }
    // Cargar relaciones para retornar datos completos
    await profile.reload({
        include: [
            { model: User, as: 'User' },
            { model: Dependencia, as: 'Dependencia' },
        ],
    });
    logger.info({
        profileId: profile.id,
        dependenciaId: profile.dependenciaId,
        userId: profile.userId,
        status: profile.status,
        creatorUserId,
    }, 'Perfil de prestador creado exitosamente');
    return profile;
};
/**
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param profileId - ID del perfil de prestador
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns PrestadorProfile encontrado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export const getPrestadorProfileById = async (profileId, organizationId, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const area = await Area.findByPk(organizationId);
    if (!area) {
        throw new NotFoundError('Área', { organizationId });
    }
    const dependenciaId = area.dependenciaId;
    const profile = await PrestadorProfile.findOne({
        where: { id: profileId, dependenciaId },
        include: [
            { model: User, as: 'User' },
            { model: Dependencia, as: 'Dependencia' },
        ],
    });
    if (!profile) {
        throw new NotFoundError('Perfil de prestador', { profileId, organizationId });
    }
    await validatePrestadorPermissions(requestingUserId, profile.userId, organizationId);
    return profile;
};
/**
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación, ordenamiento y filtros
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de prestadores con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listPrestadores = async (organizationId, filters, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const membership = await validateUserMembership(requestingUserId, organizationId);
    const area = await Area.findByPk(organizationId);
    if (!area) {
        throw new NotFoundError('Área', { organizationId });
    }
    const dependenciaId = area.dependenciaId;
    const where = {
        dependenciaId,
    };
    // Si el usuario es prestador, solo puede ver su propio perfil
    if (membership.role === 'prestador') {
        where['userId'] = requestingUserId;
    }
    // Aplicar filtros opcionales
    if (filters.status) {
        where['status'] = filters.status;
    }
    if (filters.userId) {
        where['userId'] = filters.userId;
    }
    if (filters['permitExpiresAt']) {
        // Si permitExpiresAt viene como DateTime, convertir a Date para la query
        const permitExpiresAtDate = filters['permitExpiresAt'] &&
            typeof filters['permitExpiresAt'] === 'object' &&
            'toJSDate' in filters['permitExpiresAt']
            ? filters['permitExpiresAt'].toJSDate()
            : filters['permitExpiresAt'];
        where['permitExpiresAt'] = permitExpiresAtDate;
    }
    // Configurar paginación
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;
    // Ejecutar query con paginación (includes con atributos mínimos)
    const result = await PrestadorProfile.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
            { model: Dependencia, as: 'Dependencia', attributes: ['id', 'name'] },
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
/**
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * @param profileId - ID del perfil a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns PrestadorProfile actualizado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export const updatePrestadorProfile = async (profileId, organizationId, data, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const area = await Area.findByPk(organizationId);
    if (!area) {
        throw new NotFoundError('Área', { organizationId });
    }
    const dependenciaId = area.dependenciaId;
    const profile = await PrestadorProfile.findOne({
        where: { id: profileId, dependenciaId },
    });
    if (!profile) {
        throw new NotFoundError('Perfil de prestador', { profileId, organizationId });
    }
    await validatePrestadorPermissions(requestingUserId, profile.userId, organizationId);
    // Preparar datos de actualización
    const updateData = {};
    if (data.status !== undefined) {
        updateData.status = data.status;
    }
    if (data['permitExpiresAt'] !== undefined) {
        // Convertir permitExpiresAt de DateTime a Date si está presente
        if (data['permitExpiresAt'] &&
            typeof data['permitExpiresAt'] === 'object' &&
            'toJSDate' in data['permitExpiresAt']) {
            updateData.permitExpiresAt = data['permitExpiresAt'].toJSDate();
        }
        else {
            // Si es null o cualquier otro valor, asignar null
            updateData.permitExpiresAt = null;
        }
    }
    await profile.update(updateData);
    // Cargar relaciones para retornar datos completos
    await profile.reload({
        include: [
            { model: User, as: 'User' },
            { model: Dependencia, as: 'Dependencia' },
        ],
    });
    const updatedKeys = [
        data.status !== undefined && 'status',
        data['permitExpiresAt'] !== undefined && 'permitExpiresAt',
    ].filter(Boolean);
    logger.info({
        profileId: profile.id,
        organizationId,
        userId: profile.userId,
        updatedFields: updatedKeys,
        requestingUserId,
    }, 'Perfil de prestador actualizado exitosamente');
    return profile;
};
/**
 * Crea un prestador completo: usuario, membership con rol 'prestador',
 * perfil de prestador y activos opcionales en una sola transacción.
 */
export const createPrestadorCompleto = async (organizationId, data, creatorUserId) => {
    // Validar que el creador tenga acceso a la organización y sea admin
    await assertCanAccessOrganization(creatorUserId, organizationId);
    const creatorMembership = await validateUserMembership(creatorUserId, organizationId);
    if (creatorMembership.role !== 'admin') {
        throw new ForbiddenError('Solo los administradores pueden crear prestadores completos', {
            organizationId,
            userId: creatorUserId,
            currentRole: creatorMembership.role,
        });
    }
    // Verificar límites de prestadores y activos (si se envían)
    await checkPrestadoresLimit(organizationId);
    if (data.activos && data.activos.length > 0) {
        await checkActivosLimit(organizationId);
    }
    const area = await Area.findByPk(organizationId);
    if (!area) {
        throw new NotFoundError('Área', { organizationId });
    }
    const dependenciaId = area.dependenciaId;
    const normalizedEmail = data.email.trim().toLowerCase();
    return sequelize.transaction(async (transaction) => {
        const existingUser = await User.findOne({
            where: { email: normalizedEmail },
            paranoid: false,
            transaction,
        });
        if (existingUser?.deletedAt) {
            throw new ValidationError('No se puede crear un prestador con un usuario eliminado. Usa otro email.', undefined, { email: normalizedEmail });
        }
        if (existingUser) {
            throw new ConflictError('Ya existe un usuario con este email', {
                email: normalizedEmail,
            });
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await User.create({
            email: normalizedEmail,
            name: data.name,
            password: passwordHash,
            emailVerified: true,
            onboardingStatus: 'completed',
        }, { transaction });
        const existingMembership = await Membership.findOne({
            where: { userId: user.id, areaId: organizationId },
            transaction,
        });
        if (existingMembership) {
            throw new ConflictError('El usuario ya tiene una membresía en esta área', {
                userId: user.id,
                areaId: organizationId,
                membershipId: existingMembership.id,
                existingRole: existingMembership.role,
                existingStatus: existingMembership.status,
            });
        }
        const membership = await Membership.create({
            userId: user.id,
            areaId: organizationId,
            role: 'prestador',
            status: data.status ?? 'activo',
        }, { transaction });
        // Convertir permitExpiresAt de DateTime a Date si está presente
        let permitExpiresAtDate = undefined;
        if (data['permitExpiresAt'] !== undefined) {
            if (data['permitExpiresAt'] &&
                typeof data['permitExpiresAt'] === 'object' &&
                'toJSDate' in data['permitExpiresAt']) {
                permitExpiresAtDate = data['permitExpiresAt'].toJSDate();
            }
            else if (data['permitExpiresAt'] === null) {
                permitExpiresAtDate = null;
            }
        }
        const prestador = await PrestadorProfile.create({
            userId: user.id,
            dependenciaId,
            status: data.status ?? 'activo',
            ...(permitExpiresAtDate !== undefined && { permitExpiresAt: permitExpiresAtDate }),
        }, { transaction });
        const activos = [];
        if (data.activos && data.activos.length > 0) {
            // Validar tipos de activo según ecosystem_type
            const allowedTypesByEcosystem = {
                maritimo: ['embarcacion', 'guia', 'equipo'],
                terrestre: ['vehiculo', 'guia', 'equipo'],
                mixto: ['embarcacion', 'vehiculo', 'guia', 'equipo'],
            };
            const allowedTypes = allowedTypesByEcosystem[area.ecosystem_type];
            for (const activoInput of data.activos) {
                if (!allowedTypes.includes(activoInput.type)) {
                    throw new ValidationError(`El tipo de activo '${activoInput.type}' no está permitido para áreas de tipo '${area.ecosystem_type}'`, undefined, {
                        ecosystem_type: area.ecosystem_type,
                        type: activoInput.type,
                    });
                }
            }
            // Crear activos
            for (const activoInput of data.activos) {
                const activo = await Activo.create({
                    dependenciaId,
                    ownerId: prestador.id,
                    type: activoInput.type,
                    status: 'pendiente',
                }, { transaction });
                activos.push(activo);
            }
        }
        // Cargar relaciones mínimas para la respuesta
        await prestador.reload({
            include: [
                { model: User, as: 'User' },
                { model: Dependencia, as: 'Dependencia' },
            ],
            transaction,
        });
        await Promise.all([
            membership.reload({ include: [{ model: Area, as: 'Area' }], transaction }),
            ...activos.map((a) => a.reload({
                include: [
                    { model: Dependencia, as: 'Dependencia' },
                    { model: PrestadorProfile, as: 'Owner' },
                ],
                transaction,
            })),
        ]);
        logger.info({
            prestadorId: prestador.id,
            dependenciaId,
            userId: user.id,
            membershipId: membership.id,
            activosCount: activos.length,
            creatorUserId,
        }, 'Prestador completo creado exitosamente');
        return { user, prestador, activos };
    });
};
//# sourceMappingURL=prestador-profile.service.js.map