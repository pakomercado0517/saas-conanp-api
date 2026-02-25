import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../server.js';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationWithSubscription, authRequest, AREAS_API_PREFIX, } from './helpers.js';
describe('Actividades endpoints (integration)', () => {
    let auth;
    let org;
    let actividadId;
    beforeAll(async () => {
        auth = await createTestUserAndToken(app);
        org = await createTestOrganization(app, { name: 'Org Actividades' });
        await bootstrapOrganizationWithSubscription(auth.user.id, org.id);
    });
    describe('POST /areas/:areaId/actividades', () => {
        it('crea actividad y devuelve 201', async () => {
            const res = await authRequest(app, auth.accessToken)
                .post(`${AREAS_API_PREFIX}/${org.id}/actividades`)
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
                .post(`${AREAS_API_PREFIX}/${org.id}/actividades`)
                .send({
                organizationId: org.id,
                name: '',
                type: 'invalido',
                agendaType: 'BLOQUES',
            })
                .expect(400);
        });
    });
    describe('GET /areas/:areaId/actividades', () => {
        it('lista actividades y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken)
                .get(`${AREAS_API_PREFIX}/${org.id}/actividades`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });
    describe('GET /areas/:areaId/actividades/:actividadId', () => {
        it('devuelve 200 y la actividad por id', async () => {
            const res = await authRequest(app, auth.accessToken)
                .get(`${AREAS_API_PREFIX}/${org.id}/actividades/${actividadId}`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(actividadId);
            expect(res.body.data.name).toBe('Actividad Integración');
        });
    });
    describe('PATCH /areas/:areaId/actividades/:actividadId', () => {
        it('actualiza actividad y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken)
                .patch(`${AREAS_API_PREFIX}/${org.id}/actividades/${actividadId}`)
                .send({ name: 'Actividad Actualizada' })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Actividad Actualizada');
        });
    });
    describe('DELETE /areas/:areaId/actividades/:actividadId', () => {
        it('elimina actividad y devuelve 204', async () => {
            const createRes = await authRequest(app, auth.accessToken)
                .post(`${AREAS_API_PREFIX}/${org.id}/actividades`)
                .send({
                organizationId: org.id,
                name: 'Actividad a Borrar',
                type: 'maritima',
                agendaType: 'BLOQUES',
            })
                .expect(201);
            const idToDelete = createRes.body.data.id;
            await authRequest(app, auth.accessToken)
                .delete(`${AREAS_API_PREFIX}/${org.id}/actividades/${idToDelete}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=actividades.integration.test.js.map