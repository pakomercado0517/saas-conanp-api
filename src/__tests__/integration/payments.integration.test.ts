import { describe, it, expect, beforeAll } from 'vitest';
import app from '@/server.js';
import {
  createTestUserAndToken,
  createTestOrganization,
  bootstrapOrganizationWithSubscription,
  createMembership,
  createPrestadorProfile,
  authRequest,
  type AuthResult,
  type OrganizationData,
} from './helpers.js';

const API_ORGS = '/api/v1/organizations';
const eventDate = '2026-02-20';

describe('Payments endpoints (integration)', () => {
  let adminAuth: AuthResult;
  let prestadorAuth: AuthResult;
  let org: OrganizationData;
  let actividadId: string;
  let prestadorProfileId: string;
  let eventoId: string;
  let paymentId: string;

  beforeAll(async () => {
    adminAuth = await createTestUserAndToken(app, {
      email: `admin-payments-${Date.now()}@example.com`,
      name: 'Admin Payments',
    });
    prestadorAuth = await createTestUserAndToken(app, {
      email: `prestador-payments-${Date.now()}@example.com`,
      name: 'Prestador Payments',
    });
    org = await createTestOrganization(app, { name: 'Org Payments' });
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

    const actRes = await authRequest(app, adminAuth.accessToken)
      .post(`${API_ORGS}/${org.id}/actividades`)
      .send({
        organizationId: org.id,
        name: 'Actividad Payments',
        type: 'terrestre',
        agendaType: 'HORARIO_LIBRE',
        requiresGuide: false,
        active: true,
      })
      .expect(201);
    actividadId = actRes.body.data.id;

    await authRequest(app, adminAuth.accessToken)
      .post(`${API_ORGS}/${org.id}/actividades/${actividadId}/capacidad`)
      .send({ date: eventDate, limit: 10 })
      .expect(201);

    const validFrom = '2026-02-01T00:00:00.000-06:00';
    const validTo = '2026-02-28T23:59:59.000-06:00';
    await authRequest(app, adminAuth.accessToken)
      .post(`${API_ORGS}/${org.id}/permisos`)
      .send({
        prestadorId: prestadorProfileId,
        actividadId,
        validFrom,
        validTo,
        status: 'activo',
      })
      .expect(201);

    const eventoRes = await authRequest(app, adminAuth.accessToken)
      .post(`${API_ORGS}/${org.id}/eventos`)
      .send({
        actividadId,
        prestadorId: prestadorProfileId,
        date: eventDate,
        agendaType: 'HORARIO_LIBRE',
        startTime: '09:00:00',
        endTime: '10:00:00',
        peopleCount: 1,
      })
      .expect(201);
    eventoId = eventoRes.body.data.id;
  });

  describe('POST /organizations/:organizationId/payments/intent', () => {
    it('crea Payment Intent y devuelve 201', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${API_ORGS}/${org.id}/payments/intent`)
        .send({
          eventoId,
          amount: 100.5,
          currency: 'MXN',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('clientSecret');
      expect(res.body.data).toHaveProperty('status');
      paymentId = res.body.data.id;
    });
  });

  describe('POST /organizations/:organizationId/payments/confirm', () => {
    it('confirma pago y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${API_ORGS}/${org.id}/payments/confirm`)
        .send({
          paymentId,
          stripePaymentIntentId: 'pi_mock',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('status');
    });
  });

  describe('GET /organizations/:organizationId/payments', () => {
    it('lista pagos y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${API_ORGS}/${org.id}/payments`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('GET /organizations/:organizationId/payments/:paymentId', () => {
    it('devuelve 200 y el pago por id', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${API_ORGS}/${org.id}/payments/${paymentId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(paymentId);
    });
  });

  describe('POST /organizations/:organizationId/payments/refund', () => {
    it('procesa reembolso y devuelve 200', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${API_ORGS}/${org.id}/payments/refund`)
        .send({ paymentId })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status');
    });
  });
});
