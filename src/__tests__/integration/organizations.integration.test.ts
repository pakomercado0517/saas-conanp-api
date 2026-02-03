import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/server.js';
import {
  createTestUserAndToken,
  createTestOrganization,
  bootstrapOrganizationWithSubscription,
  authRequest,
  type AuthResult,
  type OrganizationData,
} from './helpers.js';

const API = '/api/v1/organizations';

describe('Organizations endpoints (integration)', () => {
  let auth: AuthResult;
  let org: OrganizationData;

  beforeAll(async () => {
    auth = await createTestUserAndToken(app);
    org = await createTestOrganization(app, {
      name: 'Org Integración',
      ecosystem_type: 'terrestre',
    });
    await bootstrapOrganizationWithSubscription(auth.user.id, org.id);
  });

  describe('POST /organizations', () => {
    it('crea organización sin auth y devuelve 201', async () => {
      const res = await request(app)
        .post(API)
        .send({
          name: 'Nueva Org',
          ecosystem_type: 'mixto',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: 'Nueva Org',
        ecosystem_type: 'mixto',
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });
  });

  describe('GET /organizations', () => {
    it('lista organizaciones del usuario con auth y devuelve 200', async () => {
      const res = await authRequest(app, auth.accessToken).get(API).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('devuelve 401 sin token', async () => {
      await request(app).get(API).expect(401);
    });
  });

  describe('GET /organizations/:organizationId', () => {
    it('devuelve 200 y la organización cuando hay acceso y suscripción activa', async () => {
      const res = await authRequest(app, auth.accessToken).get(`${API}/${org.id}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: org.id,
        name: org.name,
        ecosystem_type: org.ecosystem_type,
      });
    });

    it('devuelve 403 para organización sin membresía', async () => {
      const otherOrg = await createTestOrganization(app, { name: 'Otra Org' });
      await authRequest(app, auth.accessToken).get(`${API}/${otherOrg.id}`).expect(403);
    });
  });

  describe('PATCH /organizations/:organizationId', () => {
    it('actualiza organización y devuelve 200', async () => {
      const res = await authRequest(app, auth.accessToken)
        .patch(`${API}/${org.id}`)
        .send({ name: 'Org Actualizada' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Org Actualizada');
    });
  });

  describe('DELETE /organizations/:organizationId', () => {
    it('elimina organización y devuelve 204', async () => {
      const toDelete = await createTestOrganization(app, { name: 'Org a Borrar' });
      await bootstrapOrganizationWithSubscription(auth.user.id, toDelete.id);

      await authRequest(app, auth.accessToken).delete(`${API}/${toDelete.id}`).expect(204);
    });
  });
});
