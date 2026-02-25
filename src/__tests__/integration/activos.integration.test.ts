import { describe, it, expect, beforeAll } from 'vitest';
import app from '@/server.js';
import {
  createTestUserAndToken,
  createTestOrganization,
  bootstrapOrganizationWithSubscription,
  createMembership,
  createPrestadorProfile,
  authRequest,
  AREAS_API_PREFIX,
  type AuthResult,
  type OrganizationData,
} from './helpers.js';

describe('Activos endpoints (integration)', () => {
  let adminAuth: AuthResult;
  let prestadorAuth: AuthResult;
  let org: OrganizationData;
  let prestadorProfileId: string;
  let activoId: string;

  beforeAll(async () => {
    adminAuth = await createTestUserAndToken(app, {
      email: `admin-activos-${Date.now()}@example.com`,
      name: 'Admin Activos',
    });
    prestadorAuth = await createTestUserAndToken(app, {
      email: `prestador-activos-${Date.now()}@example.com`,
      name: 'Prestador',
    });
    org = await createTestOrganization(app, { name: 'Org Activos' });
    await bootstrapOrganizationWithSubscription(adminAuth.user.id, org.id);
    await createMembership(app, adminAuth.accessToken, org.id, {
      userId: prestadorAuth.user.id,
      role: 'prestador',
      status: 'activo',
    });
    const prestador = await createPrestadorProfile(app, adminAuth.accessToken, org.id, {
      userId: prestadorAuth.user.id,
      status: 'activo',
    });
    prestadorProfileId = prestador.id;
  });

  describe('POST /areas/:areaId/activos', () => {
    it('crea activo y devuelve 201', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${org.id}/activos`)
        .send({
          organizationId: org.id,
          ownerId: prestadorProfileId,
          type: 'embarcacion',
          status: 'pendiente',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        type: 'embarcacion',
        status: 'pendiente',
      });
      expect(res.body.data).toHaveProperty('id');
      activoId = res.body.data.id;
    });
  });

  describe('GET /areas/:areaId/activos', () => {
    it('lista activos y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${AREAS_API_PREFIX}/${org.id}/activos`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('GET /areas/:areaId/activos/:activoId', () => {
    it('devuelve 200 y el activo por id', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${AREAS_API_PREFIX}/${org.id}/activos/${activoId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(activoId);
      expect(res.body.data.type).toBe('embarcacion');
    });
  });

  describe('PATCH /areas/:areaId/activos/:activoId', () => {
    it('actualiza activo y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .patch(`${AREAS_API_PREFIX}/${org.id}/activos/${activoId}`)
        .send({ type: 'vehiculo' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('vehiculo');
    });
  });

  describe('POST /areas/:areaId/activos/:activoId/aprobar', () => {
    it('aprueba activo y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${org.id}/activos/${activoId}/aprobar`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('aprobado');
    });
  });

  describe('DELETE /areas/:areaId/activos/:activoId', () => {
    it('elimina activo y devuelve 204', async () => {
      const createRes = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${org.id}/activos`)
        .send({
          organizationId: org.id,
          ownerId: prestadorProfileId,
          type: 'equipo',
          status: 'pendiente',
        })
        .expect(201);
      const idToDelete = createRes.body.data.id;

      await authRequest(app, adminAuth.accessToken)
        .delete(`${AREAS_API_PREFIX}/${org.id}/activos/${idToDelete}`)
        .expect(204);
    });
  });
});
