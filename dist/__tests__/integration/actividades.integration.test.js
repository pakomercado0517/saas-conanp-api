import { describe, it, expect, beforeAll } from 'vitest';
import app from '@/server.js';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationWithSubscription, authRequest, } from './helpers.js';
const API_ORGS = '/api/v1/organizations';
describe('Actividades endpoints (integration)', () => {
    let auth;
    let org;
    let actividadId;
    beforeAll(async () => {
        auth = await createTestUserAndToken(app);
        org = await createTestOrganization(app, { name: 'Org Actividades' });
        await bootstrapOrganizationWithSubscription(auth.user.id, org.id);
    });
    describe('POST /organizations/:organizationId/actividades', () => {
        it('crea actividad y devuelve 201', async () => {
            const res = await authRequest(app, auth.accessToken)
                .post(`${API_ORGS}/${org.id}/actividades`)
                .send({
                organizationId: org.id,
                name: 'Actividad Integración',
                type: 'terrestre',
                agendaType: 'HORARIO_LIBRE',
                requiresGuide: false,
                active: true,
            })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                name: 'Actividad Integración',
                type: 'terrestre',
                agendaType: 'HORARIO_LIBRE',
                active: true,
            });
            expect(res.body.data).toHaveProperty('id');
            actividadId = res.body.data.id;
        });
        it('devuelve 400 con body inválido', async () => {
            await authRequest(app, auth.accessToken)
                .post(`${API_ORGS}/${org.id}/actividades`)
                .send({
                organizationId: org.id,
                name: '',
                type: 'invalido',
                agendaType: 'BLOQUES',
            })
                .expect(400);
        });
    });
    describe('GET /organizations/:organizationId/actividades', () => {
        it('lista actividades y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken)
                .get(`${API_ORGS}/${org.id}/actividades`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });
    describe('GET /organizations/:organizationId/actividades/:actividadId', () => {
        it('devuelve 200 y la actividad por id', async () => {
            const res = await authRequest(app, auth.accessToken)
                .get(`${API_ORGS}/${org.id}/actividades/${actividadId}`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(actividadId);
            expect(res.body.data.name).toBe('Actividad Integración');
        });
    });
    describe('PATCH /organizations/:organizationId/actividades/:actividadId', () => {
        it('actualiza actividad y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken)
                .patch(`${API_ORGS}/${org.id}/actividades/${actividadId}`)
                .send({ name: 'Actividad Actualizada' })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Actividad Actualizada');
        });
    });
    describe('DELETE /organizations/:organizationId/actividades/:actividadId', () => {
        it('elimina actividad y devuelve 204', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(`${API_ORGS}/${org.id}/actividades`)
                .send({
                organizationId: org.id,
                name: 'Actividad a Borrar',
                type: 'maritima',
                agendaType: 'BLOQUES',
            })
                .expect(201);
            const idToDelete = createRes.body.data.id;
            await authRequest(app, auth.accessToken)
                .delete(`${API_ORGS}/${org.id}/actividades/${idToDelete}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=actividades.integration.test.js.map