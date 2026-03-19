import { Router, type Router as ExpressRouter } from 'express';
import {
  listCatalogo,
  createCatalogoEntry,
  updateCatalogoEntry,
  deleteCatalogoEntry,
} from '../controllers/activo-requisito-catalogo.controller.js';
import {
  validateCreateActivoRequisitoCatalogo,
  validateUpdateActivoRequisitoCatalogo,
  validateListActivoRequisitoCatalogo,
} from '../middleware/validation.middleware.js';
import {
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
} from '@/shared/middleware/index.js';

/**
 * Router del catálogo de requisitos de activos.
 * Prefijo: /api/v1/organizations/:organizationId/activo-requisito-catalogo
 * organizationId = areaId (contexto área para resolver dependencia).
 */
const activoRequisitoCatalogoRouter: ExpressRouter = Router({ mergeParams: true });

activoRequisitoCatalogoRouter.get(
  '/',
  authenticate,
  requireOrganizationAccess,
  validateListActivoRequisitoCatalogo,
  listCatalogo
);

activoRequisitoCatalogoRouter.post(
  '/',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateCreateActivoRequisitoCatalogo,
  createCatalogoEntry
);

activoRequisitoCatalogoRouter.patch(
  '/:catalogoId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateUpdateActivoRequisitoCatalogo,
  updateCatalogoEntry
);

activoRequisitoCatalogoRouter.delete(
  '/:catalogoId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  deleteCatalogoEntry
);

export default activoRequisitoCatalogoRouter;
