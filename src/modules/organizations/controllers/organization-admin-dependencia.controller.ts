import type { Request, Response } from 'express';
import * as adminService from '../services/organization-admin.service.js';
import { sendCreated } from '@/shared/responses/helpers.js';
import type { CreateDependenciaAdminDTO } from '@/modules/dependencias/validators/dependencia.validator.js';

/**
 * POST /api/v1/admin/dependencias
 * Super admin: crea dependencia + invitación al primer admin (sin área). Suscripción FREE.
 */
export const createDependenciaWithAdminInvitation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as CreateDependenciaAdminDTO;
  const userId = req.user?.userId;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const result = await adminService.createDependenciaWithAdminInvitation(data, {
    userId,
    email,
  });

  return sendCreated(res, result, 'Dependencia creada con invitación al primer admin');
};
