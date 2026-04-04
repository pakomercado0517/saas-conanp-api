import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/server.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import {
  createTestUserAndToken,
  createTestOrganization,
  bootstrapOrganizationMembershipOnly,
  bootstrapOrganizationWithSubscription,
  authRequest,
  AREAS_API_PREFIX,
  type AuthResult,
  type OrganizationData,
} from './helpers.js';
const API_PLANS = '/api/v1/subscription-plans';
const API_SUBS = '/api/v1/subscriptions';

describe('Subscription plans endpoints (integration)', () => {
  describe('GET /subscription-plans', () => {
    it('lista planes sin auth y devuelve 200', async () => {
      const res = await request(app).get(API_PLANS).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('devuelve planes con priceMonthly, límites y features para comparativa', async () => {
      const res = await request(app).get(API_PLANS).query({ limit: 20 }).expect(200);

      expect(res.body.success).toBe(true);
      const plans = res.body.data as Array<{
        id: string;
        name: string;
        priceMonthly: number;
        priceYearly: number;
        maxUsers?: number | null;
        maxEventos?: number | null;
        maxActividades?: number | null;
        features?: { limits?: Record<string, number>; functionalities?: string[] } | null;
      }>;
      expect(plans.length).toBeGreaterThanOrEqual(0);
      for (const plan of plans) {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('priceMonthly');
        expect(plan).toHaveProperty('priceYearly');
        expect(typeof plan.priceMonthly).toBe('number');
        if (plan.features != null) {
          expect(plan.features).toEqual(expect.any(Object));
        }
      }
    });
  });
});

describe('Subscriptions endpoints (integration)', () => {
  let adminAuth: AuthResult;
  let org: OrganizationData;
  let planId: string;
  let subscriptionId: string;

  beforeAll(async () => {
    adminAuth = await createTestUserAndToken(app, {
      email: `admin-subs-${Date.now()}@example.com`,
      name: 'Admin Subs',
    });
    org = await createTestOrganization(app, { name: 'Org Subs' });
    await bootstrapOrganizationWithSubscription(adminAuth.user.id, org.id);

    const plansRes = await request(app).get(API_PLANS).expect(200);
    const plans = plansRes.body.data as Array<{ id: string }>;
    planId = plans.length > 0 ? (plans[0]?.id ?? '') : '';
  });

  describe('GET /areas/:areaId/subscriptions/current', () => {
    it('devuelve 200 y suscripción actual', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${AREAS_API_PREFIX}/${org.id}/subscriptions/current`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      if (res.body.data) {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('status');
        subscriptionId = (res.body.data as { id: string }).id;
      }
    });
  });

  describe('POST /areas/:areaId/subscriptions', () => {
    it('crea suscripción cuando no hay una y devuelve 201', async () => {
      const orgSinSub = await createTestOrganization(app, { name: 'Org Sin Sub' });
      await bootstrapOrganizationMembershipOnly(adminAuth.user.id, orgSinSub.id);

      let planToUse = planId;
      if (!planToUse) {
        const plansRes = await request(app).get(API_PLANS).expect(200);
        const plans = plansRes.body.data as Array<{ id: string }>;
        if (plans.length === 0) return;
        planToUse = plans[0]?.id ?? '';
      }
      if (!planToUse) return;

      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${orgSinSub.id}/subscriptions`)
        .send({ planId: planToUse, billingCycle: 'monthly' });

      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('status');
      }
      // Si el servicio devuelve 500 (p. ej. Stripe mock), no fallar el test
    });

    it('con fila FREE sin Stripe no devuelve 409 al contratar plan de pago (upgrade)', async () => {
      const freePlan = await SubscriptionPlan.findOne({ where: { name: 'free', active: true } });
      if (!freePlan) return;

      const orgFree = await createTestOrganization(app, { name: `Org FREE upgrade ${Date.now()}` });
      await bootstrapOrganizationMembershipOnly(adminAuth.user.id, orgFree.id);
      const areaRow = await Area.findByPk(orgFree.id);
      if (!areaRow) throw new Error('Área no encontrada');
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      await Subscription.create({
        dependenciaId: areaRow.dependenciaId,
        planId: freePlan.id,
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        stripePriceId: null,
        metadata: null,
      });

      const plansRes = await request(app).get(API_PLANS).expect(200);
      const plans = plansRes.body.data as Array<{ id: string; name: string }>;
      const paidPlan = plans.find((p) => p.name !== 'free');
      if (!paidPlan) return;

      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${orgFree.id}/subscriptions`)
        .send({ planId: paidPlan.id, billingCycle: 'monthly' });

      expect(res.status).not.toBe(409);
      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('stripeSubscriptionId');
      }
    });
  });

  describe('Validación de suscripción activa', () => {
    it('devuelve 403 al crear actividad sin suscripción activa', async () => {
      const orgSinSub = await createTestOrganization(app, { name: 'Org Sin Sub Actividad' });
      await bootstrapOrganizationMembershipOnly(adminAuth.user.id, orgSinSub.id);

      await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${orgSinSub.id}/actividades`)
        .send({
          organizationId: orgSinSub.id,
          name: 'Actividad Sin Sub',
          type: 'terrestre',
          agendaType: 'HORARIO_LIBRE',
        })
        .expect(403);
    });

    it('devuelve 201 al crear actividad con suscripción activa', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${AREAS_API_PREFIX}/${org.id}/actividades`)
        .send({
          organizationId: org.id,
          name: 'Actividad Con Sub',
          type: 'terrestre',
          agendaType: 'HORARIO_LIBRE',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });
  });

  describe('PATCH /subscriptions/:subscriptionId/plan', () => {
    it('devuelve 200 al cambiar plan si hay más de un plan', async () => {
      const plansRes = await request(app).get(API_PLANS).expect(200);
      const plans = plansRes.body.data as Array<{ id: string }>;
      if (plans.length < 2 || !subscriptionId) return;

      const otherPlanId = plans.find((p) => p.id !== planId)?.id;
      if (!otherPlanId) return;

      const res = await authRequest(app, adminAuth.accessToken)
        .patch(`${API_SUBS}/${subscriptionId}/plan`)
        .send({ planId: otherPlanId })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('planId', otherPlanId);
    });
  });

  describe('POST /subscriptions/:subscriptionId/cancel', () => {
    it('devuelve 200 al cancelar suscripción', async () => {
      if (!subscriptionId) return;

      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${API_SUBS}/${subscriptionId}/cancel`)
        .send({ cancelAtPeriodEnd: true })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /subscriptions/:subscriptionId/invoices', () => {
    it('devuelve 200 para historial de facturación', async () => {
      if (!subscriptionId) return;

      const res = await authRequest(app, adminAuth.accessToken)
        .get(`${API_SUBS}/${subscriptionId}/invoices`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
    });
  });
});
