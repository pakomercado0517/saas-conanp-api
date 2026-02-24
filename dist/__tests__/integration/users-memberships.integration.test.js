import { describe, it, expect, beforeAll } from 'vitest';
import app from '@/server.js';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationWithSubscription, createMembership, authRequest, } from './helpers.js';
const API_ORGS = '/api/v1/organizations';
const API_USERS = '/api/v1/users';
describe('Users endpoints (integration)', () => {
    let auth;
    let org;
    beforeAll(async () => {
        auth = await createTestUserAndToken(app);
        org = await createTestOrganization(app);
        await bootstrapOrganizationWithSubscription(auth.user.id, org.id);
    });
    describe('GET /users/profile', () => {
        it('devuelve 200 y perfil del usuario', async () => {
            const res = await authRequest(app, auth.accessToken).get(`${API_USERS}/profile`).expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: auth.user.id,
                email: auth.user.email,
                name: auth.user.name,
            });
            expect(res.body.data).toHaveProperty('createdAt');
            expect(res.body.data).toHaveProperty('updatedAt');
        });
        it('devuelve 401 sin token', async () => {
            await authRequest(app, '').get(`${API_USERS}/profile`).expect(401);
        });
    });
    describe('PATCH /users/profile', () => {
        it('actualiza nombre y devuelve 200', async () => {
            const res = await authRequest(app, auth.accessToken)
                .patch(`${API_USERS}/profile`)
                .send({ name: 'Nombre Actualizado' })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Nombre Actualizado');
        });
    });
    describe('PATCH /users/password', () => {
        it('cambia contraseña y devuelve 204', async () => {
            await authRequest(app, auth.accessToken)
                .patch(`${API_USERS}/password`)
                .send({
                currentPassword: 'password123',
                newPassword: 'newpassword456',
            })
                .expect(204);
        });
    });
});
describe('Memberships endpoints (integration)', () => {
    let adminAuth;
    let memberAuth;
    let org;
    beforeAll(async () => {
        adminAuth = await createTestUserAndToken(app, {
            email: `admin-${Date.now()}@example.com`,
            name: 'Admin',
        });
        memberAuth = await createTestUserAndToken(app, {
            email: `member-${Date.now()}@example.com`,
            name: 'Member',
        });
        org = await createTestOrganization(app, { name: 'Org Memberships' });
        await bootstrapOrganizationWithSubscription(adminAuth.user.id, org.id);
    });
    describe('POST /organizations/:organizationId/memberships', () => {
        it('invita usuario y devuelve 201', async () => {
            const membership = await createMembership(app, adminAuth.accessToken, org.id, {
                userId: memberAuth.user.id,
                role: 'prestador',
                status: 'activo',
            });
            expect(membership).toMatchObject({
                userId: memberAuth.user.id,
                organizationId: org.id,
                role: 'prestador',
                status: 'activo',
            });
            expect(membership).toHaveProperty('id');
        });
    });
    describe('GET /organizations/:organizationId/memberships', () => {
        it('lista memberships y devuelve 200', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .get(`${API_ORGS}/${org.id}/memberships`)
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });
    describe('PATCH /organizations/:organizationId/memberships/:membershipId', () => {
        it('actualiza rol y devuelve 200', async () => {
            const listRes = await authRequest(app, adminAuth.accessToken)
                .get(`${API_ORGS}/${org.id}/memberships`)
                .query({ limit: 10 });
            const membershipId = listRes.body.data?.find((m) => m.userId === memberAuth.user.id)?.id;
            if (!membershipId)
                throw new Error('Membership not found');
            const res = await authRequest(app, adminAuth.accessToken)
                .patch(`${API_ORGS}/${org.id}/memberships/${membershipId}`)
                .send({ role: 'observador' })
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('observador');
        });
    });
    describe('DELETE /organizations/:organizationId/memberships/:membershipId', () => {
        it('elimina membership y devuelve 204', async () => {
            const invitee = await createTestUserAndToken(app, {
                email: `invitee-${Date.now()}@example.com`,
            });
            const createRes = await authRequest(app, adminAuth.accessToken)
                .post(`${API_ORGS}/${org.id}/memberships`)
                .send({ userId: invitee.user.id, role: 'observador' })
                .expect(201);
            const membershipId = createRes.body.data.id;
            await authRequest(app, adminAuth.accessToken)
                .delete(`${API_ORGS}/${org.id}/memberships/${membershipId}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=users-memberships.integration.test.js.map