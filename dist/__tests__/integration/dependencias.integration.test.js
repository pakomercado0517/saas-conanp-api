import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { createTestUserAndToken, authRequest } from './helpers.js';
import { SubscriptionPlan } from '../../modules/subscriptions/models/subscription-plan.model.js';
const DEPENDENCIAS_PREFIX = '/api/v1/dependencias';
describe('Dependencias endpoints (integration)', () => {
    let auth;
    beforeAll(async () => {
        const [freePlan] = await SubscriptionPlan.findOrCreate({
            where: { name: 'free' },
            defaults: {
                name: 'free',
                description: 'Plan gratuito',
                priceMonthly: 0,
                priceYearly: 0,
                maxUsers: 2,
                maxEventos: 5,
                maxActividades: 2,
                active: true,
            },
        });
        if (!freePlan.active) {
            await freePlan.update({ active: true });
        }
        auth = await createTestUserAndToken(app);
    });
    describe('POST /dependencias', () => {
        it('crea dependencia con auth y devuelve 201', async () => {
            const res = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Integración', settings: {} })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                name: 'Dep Integración',
            });
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('createdAt');
            expect(res.body.data).toHaveProperty('updatedAt');
        });
        it('devuelve 401 sin token', async () => {
            await request(app)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Sin Auth', settings: {} })
                .expect(401);
        });
        it('plan FREE: rechaza segunda dependencia con 400', async () => {
            const userAuth = await createTestUserAndToken(app);
            await authRequest(app, userAuth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Primera Dep FREE', settings: {} })
                .expect(201);
            const res = await authRequest(app, userAuth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Segunda Dep FREE', settings: {} })
                .expect(400);
            expect(res.body.success).toBe(false);
            expect(res.body.code).toBe('VALIDATION_ERROR');
            expect(res.body.message).toMatch(/plan gratuito|1 dependencia/i);
        });
    });
    describe('GET /dependencias', () => {
        it('lista dependencias del usuario y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken).get(DEPENDENCIAS_PREFIX).expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
        it('devuelve 401 sin token', async () => {
            await request(app).get(DEPENDENCIAS_PREFIX).expect(401);
        });
    });
    describe('GET /dependencias/:dependenciaId', () => {
        it('devuelve 200 y la dependencia cuando hay acceso', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Get By Id', settings: {} })
                .expect(201);
            const dependenciaId = createRes.body.data.id;
            const res = await authRequest(app, auth.accessToken)
                .get(`${DEPENDENCIAS_PREFIX}/${dependenciaId}`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: dependenciaId,
                name: 'Dep Get By Id',
            });
        });
        it('devuelve 403 para dependencia sin acceso', async () => {
            const otherAuth = await createTestUserAndToken(app);
            const createRes = await authRequest(app, otherAuth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Otro Usuario', settings: {} })
                .expect(201);
            const dependenciaId = createRes.body.data.id;
            await authRequest(app, auth.accessToken)
                .get(`${DEPENDENCIAS_PREFIX}/${dependenciaId}`)
                .expect(403);
        });
    });
    describe('PATCH /dependencias/:dependenciaId', () => {
        it('actualiza dependencia y devuelve 200', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Patch', settings: {} })
                .expect(201);
            const dependenciaId = createRes.body.data.id;
            const res = await authRequest(app, auth.accessToken)
                .patch(`${DEPENDENCIAS_PREFIX}/${dependenciaId}`)
                .send({ name: 'Dep Patch Actualizada' })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Dep Patch Actualizada');
        });
    });
    describe('POST /dependencias/:dependenciaId/areas', () => {
        it('crea área bajo dependencia y devuelve 201', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Con Area', settings: {} })
                .expect(201);
            const dependenciaId = createRes.body.data.id;
            const res = await authRequest(app, auth.accessToken)
                .post(`${DEPENDENCIAS_PREFIX}/${dependenciaId}/areas`)
                .send({
                name: 'ANP Dep Con Area',
                ecosystem_type: 'terrestre',
                settings: {},
            })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                dependenciaId,
                name: 'ANP Dep Con Area',
                ecosystem_type: 'terrestre',
            });
            expect(res.body.data).toHaveProperty('id');
        });
        it('plan FREE: rechaza segunda área en la misma dependencia con 400', async () => {
            const userAuth = await createTestUserAndToken(app);
            const createDepRes = await authRequest(app, userAuth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep Una Area FREE', settings: {} })
                .expect(201);
            const dependenciaId = createDepRes.body.data.id;
            await authRequest(app, userAuth.accessToken)
                .post(`${DEPENDENCIAS_PREFIX}/${dependenciaId}/areas`)
                .send({
                name: 'Primera Area',
                ecosystem_type: 'terrestre',
                settings: {},
            })
                .expect(201);
            const res = await authRequest(app, userAuth.accessToken)
                .post(`${DEPENDENCIAS_PREFIX}/${dependenciaId}/areas`)
                .send({
                name: 'Segunda Area',
                ecosystem_type: 'maritimo',
                settings: {},
            })
                .expect(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/plan gratuito|1 área|áreas/i);
        });
    });
    describe('GET /dependencias/:dependenciaId/areas', () => {
        it('lista áreas de la dependencia y devuelve 200', async () => {
            const createDepRes = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep List Areas', settings: {} })
                .expect(201);
            const dependenciaId = createDepRes.body.data.id;
            await authRequest(app, auth.accessToken)
                .post(`${DEPENDENCIAS_PREFIX}/${dependenciaId}/areas`)
                .send({
                name: 'ANP List',
                ecosystem_type: 'mixto',
                settings: {},
            })
                .expect(201);
            const res = await authRequest(app, auth.accessToken)
                .get(`${DEPENDENCIAS_PREFIX}/${dependenciaId}/areas`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body).toHaveProperty('pagination');
        });
    });
    describe('DELETE /dependencias/:dependenciaId', () => {
        it('elimina dependencia y devuelve 204', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(DEPENDENCIAS_PREFIX)
                .send({ name: 'Dep A Borrar', settings: {} })
                .expect(201);
            const dependenciaId = createRes.body.data.id;
            await authRequest(app, auth.accessToken)
                .delete(`${DEPENDENCIAS_PREFIX}/${dependenciaId}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=dependencias.integration.test.js.map