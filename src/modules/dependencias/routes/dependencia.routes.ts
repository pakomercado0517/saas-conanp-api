import { Router, type Router as ExpressRouter } from 'express';
import {
  createDependencia,
  listDependencias,
  getDependenciaById,
  updateDependencia,
  deleteDependencia,
  createAreaUnderDependencia,
  listAreasByDependencia,
} from '../controllers/dependencia.controller.js';
import {
  createDependenciaInvitation,
  listDependenciaInvitations,
  revokeDependenciaInvitation,
} from '../controllers/dependencia-invitation.controller.js';
import {
  validateCreateDependencia,
  validateUpdateDependencia,
  validateListDependencias,
  validateCreateAreaUnderDependencia,
} from '../middleware/validation.middleware.js';
import {
  validateCreateDependenciaInvitation,
  validateListDependenciaInvitations,
} from '../middleware/dependencia-invitation-validation.middleware.js';
import { authenticate, requireDependenciaAccess } from '@/shared/middleware/index.js';

const dependenciaRouter: ExpressRouter = Router();

/** POST /api/v1/dependencias - Crear dependencia (usuario autenticado queda como owner, suscripción FREE) */
dependenciaRouter.post('/', authenticate, validateCreateDependencia, createDependencia);

/** GET /api/v1/dependencias - Listar dependencias del usuario (por DependenciaMembership) */
dependenciaRouter.get('/', authenticate, validateListDependencias, listDependencias);

/** GET /api/v1/dependencias/:dependenciaId - Obtener una dependencia */
dependenciaRouter.get(
  '/:dependenciaId',
  authenticate,
  requireDependenciaAccess,
  getDependenciaById
);

/** PATCH /api/v1/dependencias/:dependenciaId - Actualizar dependencia */
dependenciaRouter.patch(
  '/:dependenciaId',
  authenticate,
  requireDependenciaAccess,
  validateUpdateDependencia,
  updateDependencia
);

/** DELETE /api/v1/dependencias/:dependenciaId - Eliminar dependencia (soft delete) */
dependenciaRouter.delete(
  '/:dependenciaId',
  authenticate,
  requireDependenciaAccess,
  deleteDependencia
);

/** POST /api/v1/dependencias/:dependenciaId/areas - Crear área bajo la dependencia */
dependenciaRouter.post(
  '/:dependenciaId/areas',
  authenticate,
  requireDependenciaAccess,
  validateCreateAreaUnderDependencia,
  createAreaUnderDependencia
);

/** GET /api/v1/dependencias/:dependenciaId/areas - Listar áreas de la dependencia */
dependenciaRouter.get(
  '/:dependenciaId/areas',
  authenticate,
  requireDependenciaAccess,
  listAreasByDependencia
);

/** POST /api/v1/dependencias/:dependenciaId/invitations - Crear invitación (primer admin u otros) */
dependenciaRouter.post(
  '/:dependenciaId/invitations',
  authenticate,
  requireDependenciaAccess,
  validateCreateDependenciaInvitation,
  createDependenciaInvitation
);

/** GET /api/v1/dependencias/:dependenciaId/invitations - Listar invitaciones de la dependencia */
dependenciaRouter.get(
  '/:dependenciaId/invitations',
  authenticate,
  requireDependenciaAccess,
  validateListDependenciaInvitations,
  listDependenciaInvitations
);

/** POST /api/v1/dependencias/:dependenciaId/invitations/:invitationId/revoke - Revocar invitación */
dependenciaRouter.post(
  '/:dependenciaId/invitations/:invitationId/revoke',
  authenticate,
  requireDependenciaAccess,
  revokeDependenciaInvitation
);

export default dependenciaRouter;
