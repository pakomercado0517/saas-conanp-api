import type { Request, Response } from 'express';
import * as adminService from '../services/organization-admin.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  ListOrganizationsDTO,
} from '../validators/organization.validator.js';

/**
 * Crea una nueva organización (super admin)
 *
 * POST /api/v1/admin/organizations
 */
export const createOrganization = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as CreateOrganizationDTO;
  const userId = req.user?.userId;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const result = await adminService.createOrganization(data, { userId, email });

  return sendCreated(res, result, 'Organización creada exitosamente');
};

/**
 * Lista todas las organizaciones (super admin)
 *
 * GET /api/v1/admin/organizations
 */
export const listOrganizations = async (req: Request, res: Response): Promise<Response> => {
  const filters = req.validatedQuery as ListOrganizationsDTO;
  const result = await adminService.listAllOrganizations(filters);

  return sendPaginated(
    res,
    result.data,
    result.pagination,
    'Organizaciones obtenidas exitosamente'
  );
};

/**
 * Obtiene una organización por ID (super admin)
 *
 * GET /api/v1/admin/organizations/:organizationId
 */
export const getOrganizationById = async (req: Request, res: Response): Promise<Response> => {
  const organizationId =
    typeof req.params['organizationId'] === 'string'
      ? req.params['organizationId']
      : (req.params['organizationId']?.[0] ?? '');
  const org = await adminService.getOrganizationById(organizationId);

  return sendSuccess(res, org, 'Organización obtenida exitosamente');
};

/**
 * Actualiza una organización (super admin)
 *
 * PATCH /api/v1/admin/organizations/:organizationId
 */
export const updateOrganization = async (req: Request, res: Response): Promise<Response> => {
  const organizationId =
    typeof req.params['organizationId'] === 'string'
      ? req.params['organizationId']
      : (req.params['organizationId']?.[0] ?? '');
  const data = req.body as UpdateOrganizationDTO;
  const org = await adminService.updateOrganization(organizationId, data);

  return sendSuccess(res, org, 'Organización actualizada exitosamente');
};

/**
 * Elimina una organización (super admin, soft delete)
 *
 * DELETE /api/v1/admin/organizations/:organizationId
 */
export const deleteOrganization = async (req: Request, res: Response): Promise<Response> => {
  const organizationId =
    typeof req.params['organizationId'] === 'string'
      ? req.params['organizationId']
      : (req.params['organizationId']?.[0] ?? '');
  await adminService.deleteOrganization(organizationId);

  return sendNoContent(res);
};
