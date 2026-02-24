import { describe, it, expect, beforeAll } from 'vitest';
import app from '@/server.js';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationWithSubscription, createMembership, createPrestadorProfile, authRequest, } from './helpers.js';
const API_ORGS = '/api/v1/organizations';
describe('Eventos endpoints (integration)', () => {
    let adminAuth;
    let prestadorAuth;
    let org;
    let actividadId;
    let prestadorProfileId;
    let eventoId;
    const eventDate = '2026-02-15';
    beforeAll(async () => {
        adminAuth = await createTestUserAndToken(app, {
            email: `admin-eventos-${Date.now()}@example.com`,
            name: 'Admin Eventos',
        });
        prestadorAuth = await createTestUserAndToken(app, {
            email: `prestador-eventos-${Date.now()}@example.com`,
            name: 'Prestador Eventos',
        });
        org = await createTestOrganization(app, { name: 'Org Eventos' });
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
            name: 'Actividad Eventos',
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
    });
    describe('POST /organizations/:organizationId/eventos', () => {
        it('crea evento HORARIO_LIBRE y devuelve 201', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
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
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.date).toBe(eventDate);
            eventoId = res.body.data.id;
        });
    });
    describe('GET /organizations/:organizationId/eventos', () => {
        it('lista eventos y devuelve 200', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .get(`${API_ORGS}/${org.id}/eventos`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });
    describe('GET /organizations/:organizationId/eventos/:eventoId', () => {
        it('devuelve 200 y el evento por id', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .get(`${API_ORGS}/${org.id}/eventos/${eventoId}`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(eventoId);
            expect(res.body.data.date).toBe(eventDate);
        });
    });
    describe('PATCH /organizations/:organizationId/eventos/:eventoId', () => {
        it('actualiza evento y devuelve 200', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .patch(`${API_ORGS}/${org.id}/eventos/${eventoId}`)
                .send({ peopleCount: 2 })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.peopleCount).toBe(2);
        });
    });
    describe('DELETE /organizations/:organizationId/eventos/:eventoId', () => {
        it('elimina evento y devuelve 204', async () => {
            const createRes = await authRequest(app, adminAuth.accessToken)
                .post(`${API_ORGS}/${org.id}/eventos`)
                .send({
                actividadId,
                prestadorId: prestadorProfileId,
                date: eventDate,
                agendaType: 'HORARIO_LIBRE',
                startTime: '11:00:00',
                endTime: '12:00:00',
                peopleCount: 1,
            })
                .expect(201);
            const idToDelete = createRes.body.data.id;
            await authRequest(app, adminAuth.accessToken)
                .delete(`${API_ORGS}/${org.id}/eventos/${idToDelete}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=eventos.integration.test.js.map