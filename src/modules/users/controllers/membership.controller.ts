import type { Request, Response } from 'express';
import * as membershipService from '../services/membership.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateMembershipDTO,
  UpdateMembershipDTO,
  ListMembershipsDTO,
} from '../validators/membership.validator.js';

/**
 * Invita un usuario a una organización creando una nueva membership.
 * Solo los administradores pueden invitar usuarios.
 *
 * POST /api/v1/organizations/:organizationId/memberships
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - userId: UUID (requerido)
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (requerido)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Membership con relaciones User y Organization,
 *   message: "Usuario invitado a organización exitosamente"
 * }
 */
export const inviteUser = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as CreateMembershipDTO;

  const membership = await membershipService.inviteUserToOrganization(organizationId, data, userId);

  return sendCreated(res, membership, 'Usuario invitado a organización exitosamente');
};

/**
 * Lista las memberships de una organización con paginación y filtros.
 * El usuario debe tener acceso a la organización.
 *
 * GET /api/v1/organizations/:organizationId/memberships
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'role' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (opcional, filtro)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Membership[] con relaciones User y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Memberships obtenidas exitosamente"
 * }
 */
export const listMemberships = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const filters = req.validatedQuery as ListMembershipsDTO;

  const result = await membershipService.listMemberships(organizationId, filters, userId);

  return sendPaginated(res, result.data, result.pagination, 'Memberships obtenidas exitosamente');
};

/**
 * Actualiza el rol y/o estado de una membership existente.
 * Solo los administradores pueden actualizar memberships.
 *
 * PATCH /api/v1/organizations/:organizationId/memberships/:membershipId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - membershipId: UUID
 *
 * Body (al menos uno requerido):
 * - role: 'admin' | 'gestor' | 'prestador' | 'observador' (opcional)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Membership actualizada con relaciones User y Organization,
 *   message: "Membership actualizada exitosamente"
 * }
 */
export const updateMembershipRole = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const membershipId = req.params['membershipId'] as string;
  const userId = req.user.userId;
  const data = req.body as UpdateMembershipDTO;

  const membership = await membershipService.updateMembershipRole(
    membershipId,
    organizationId,
    data,
    userId
  );

  return sendSuccess(res, membership, 'Membership actualizada exitosamente');
};

/**
 * Elimina una membership.
 * Solo los administradores pueden eliminar memberships.
 *
 * DELETE /api/v1/organizations/:organizationId/memberships/:membershipId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - membershipId: UUID
 *
 * Respuesta 204: No Content
 */
export const deleteMembership = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const membershipId = req.params['membershipId'] as string;
  const userId = req.user.userId;

  await membershipService.deleteMembership(membershipId, organizationId, userId);

  return sendNoContent(res);
};
