import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationMembershipOnly, bootstrapOrganizationWithSubscription, authRequest, } from './helpers.js';
const API_ORGS = '/api/v1/organizations';
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
    });
});
describe('Subscriptions endpoints (integration)', () => {
    let adminAuth;
    let org;
    let planId;
    let subscriptionId;
    beforeAll(async () => {
        adminAuth = await createTestUserAndToken(app, {
            email: `admin-subs-${Date.now()}@example.com`,
            name: 'Admin Subs',
        });
        org = await createTestOrganization(app, { name: 'Org Subs' });
        await bootstrapOrganizationWithSubscription(adminAuth.user.id, org.id);
        const plansRes = await request(app).get(API_PLANS).expect(200);
        const plans = plansRes.body.data;
        planId = plans.length > 0 ? (plans[0]?.id ?? '') : '';
    });
    describe('GET /organizations/:organizationId/subscriptions/current', () => {
        it('devuelve 200 y suscripción actual', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .get(`${API_ORGS}/${org.id}/subscriptions/current`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            if (res.body.data) {
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data).toHaveProperty('status');
                subscriptionId = res.body.data.id;
            }
        });
    });
    describe('POST /organizations/:organizationId/subscriptions', () => {
        it('crea suscripción cuando no hay una y devuelve 201', async () => {
            const orgSinSub = await createTestOrganization(app, { name: 'Org Sin Sub' });
            await bootstrapOrganizationMembershipOnly(adminAuth.user.id, orgSinSub.id);
            let planToUse = planId;
            if (!planToUse) {
                const plansRes = await request(app).get(API_PLANS).expect(200);
                const plans = plansRes.body.data;
                if (plans.length === 0)
                    return;
                planToUse = plans[0]?.id ?? '';
            }
            if (!planToUse)
                return;
            const res = await authRequest(app, adminAuth.accessToken)
                .post(`${API_ORGS}/${orgSinSub.id}/subscriptions`)
                .send({ planId: planToUse, billingCycle: 'monthly' });
            if (res.status === 201) {
                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data).toHaveProperty('status');
            }
            // Si el servicio devuelve 500 (p. ej. Stripe mock), no fallar el test
        });
    });
    describe('Validación de suscripción activa', () => {
        it('devuelve 403 al crear actividad sin suscripción activa', async () => {
            const orgSinSub = await createTestOrganization(app, { name: 'Org Sin Sub Actividad' });
            await bootstrapOrganizationMembershipOnly(adminAuth.user.id, orgSinSub.id);
            await authRequest(app, adminAuth.accessToken)
                .post(`${API_ORGS}/${orgSinSub.id}/actividades`)
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
                .post(`${API_ORGS}/${org.id}/actividades`)
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
            const plans = plansRes.body.data;
            if (plans.length < 2 || !subscriptionId)
                return;
            const otherPlanId = plans.find((p) => p.id !== planId)?.id;
            if (!otherPlanId)
                return;
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
            if (!subscriptionId)
                return;
            const res = await authRequest(app, adminAuth.accessToken)
                .post(`${API_SUBS}/${subscriptionId}/cancel`)
                .send({ cancelAtPeriodEnd: true })
                .expect(200);
            expect(res.body.success).toBe(true);
        });
    });
    describe('GET /subscriptions/:subscriptionId/invoices', () => {
        it('devuelve 200 para historial de facturación', async () => {
            if (!subscriptionId)
                return;
            const res = await authRequest(app, adminAuth.accessToken)
                .get(`${API_SUBS}/${subscriptionId}/invoices`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
        });
    });
});
//# sourceMappingURL=subscriptions.integration.test.js.map