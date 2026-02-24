import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/server.js';
import { createTestUserAndToken } from './helpers.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { Invitation } from '@/modules/users/models/invitation.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
const API = '/api/v1/admin/organizations';
describe('Admin Organizations endpoints (integration)', () => {
    let superAdmin;
    beforeAll(async () => {
        const [freePlan] = await SubscriptionPlan.findOrCreate({
            where: { name: 'free' },
            defaults: {
                name: 'free',
                description: 'Plan gratuito para pruebas',
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
        const email = `superadmin-${Date.now()}@example.com`;
        process.env['SUPER_ADMIN_EMAILS'] = email;
        superAdmin = await createTestUserAndToken(app, {
            email,
            password: 'password123',
            name: 'Super Admin Test',
        });
    });
    it('crea organización y membership admin cuando admin_email ya existe', async () => {
        const existingAdmin = await createTestUserAndToken(app, {
            email: `existing-admin-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Existing Admin',
        });
        const res = await request(app)
            .post(API)
            .set('Authorization', `Bearer ${superAdmin.accessToken}`)
            .send({
            name: `Org Existing Admin ${Date.now()}`,
            ecosystem_type: 'terrestre',
            admin_email: existingAdmin.user.email,
        })
            .expect(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            adminAssignment: 'membership_created',
            adminEmail: existingAdmin.user.email.toLowerCase(),
        });
        const membership = await Membership.findOne({
            where: {
                organizationId: res.body.data.id,
                userId: existingAdmin.user.id,
            },
        });
        expect(membership).toBeTruthy();
        expect(membership?.role).toBe('admin');
        expect(membership?.status).toBe('activo');
    });
    it('crea organización e invitación admin cuando admin_email no existe', async () => {
        const adminEmail = `invited-admin-${Date.now()}@example.com`;
        const res = await request(app)
            .post(API)
            .set('Authorization', `Bearer ${superAdmin.accessToken}`)
            .send({
            name: `Org Invited Admin ${Date.now()}`,
            ecosystem_type: 'mixto',
            admin_email: adminEmail,
        })
            .expect(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            adminAssignment: 'invitation_created',
            adminEmail,
        });
        expect(res.body.data).toHaveProperty('invitationId');
        const invitation = await Invitation.findByPk(res.body.data.invitationId);
        expect(invitation).toBeTruthy();
        expect(invitation?.organizationId).toBe(res.body.data.id);
        expect(invitation?.email).toBe(adminEmail);
        expect(invitation?.role).toBe('admin');
        expect(invitation?.status).toBe('pending');
        expect(invitation?.invitedBy).toBe(superAdmin.user.id);
    });
    it('devuelve 400 cuando admin_email es inválido', async () => {
        const res = await request(app)
            .post(API)
            .set('Authorization', `Bearer ${superAdmin.accessToken}`)
            .send({
            name: `Org Invalid Email ${Date.now()}`,
            ecosystem_type: 'maritimo',
            admin_email: 'email-invalido',
        })
            .expect(400);
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
    it('devuelve 400 cuando admin_email pertenece a usuario eliminado', async () => {
        const deletedAdmin = await createTestUserAndToken(app, {
            email: `deleted-admin-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Deleted Admin',
        });
        await User.destroy({ where: { id: deletedAdmin.user.id } });
        const res = await request(app)
            .post(API)
            .set('Authorization', `Bearer ${superAdmin.accessToken}`)
            .send({
            name: `Org Deleted Admin ${Date.now()}`,
            ecosystem_type: 'terrestre',
            admin_email: deletedAdmin.user.email,
        })
            .expect(400);
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});
//# sourceMappingURL=admin-organizations.integration.test.js.map