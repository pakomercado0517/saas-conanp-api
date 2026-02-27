import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import app from '../../server.js';
import request from 'supertest';
import { createTestUserAndToken, createTestOrganization, bootstrapOrganizationWithSubscription, authRequest, AREAS_API_PREFIX, } from './helpers.js';
import { DateTime } from 'luxon';
import { Invitation } from '../../modules/users/models/invitation.model.js';
import { InvitationEmailProof } from '../../modules/users/models/invitation-email-proof.model.js';
import { Membership } from '../../modules/users/models/membership.model.js';
import { User } from '../../modules/users/models/user.model.js';
import { OnboardingInvitation } from '../../modules/users/models/onboarding-invitation.model.js';
const API = '/api/v1';
const BCRYPT_ROUNDS = 10;
describe('Invitaciones y registro con invitación (integration)', () => {
    let adminAuth;
    let org;
    const invitedEmail = `invited-${Date.now()}@example.com`;
    beforeAll(async () => {
        adminAuth = await createTestUserAndToken(app, {
            email: `admin-inv-${Date.now()}@example.com`,
            name: 'Admin Inv',
        });
        org = await createTestOrganization(app, { name: 'Org Invitations' });
        await bootstrapOrganizationWithSubscription(adminAuth.user.id, org.id);
    });
    afterAll(() => {
        process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
    });
    describe('POST /areas/:areaId/invitations', () => {
        it('crea invitación y devuelve 201 (email puede fallar en test)', async () => {
            const res = await authRequest(app, adminAuth.accessToken)
                .post(`${AREAS_API_PREFIX}/${org.id}/invitations`)
                .send({ email: invitedEmail, role: 'prestador' });
            if (res.status === 201) {
                expect(res.body.success).toBe(true);
                expect(res.body.data).toMatchObject({
                    email: invitedEmail,
                    role: 'prestador',
                    status: 'pending',
                });
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data).toHaveProperty('expiresAt');
            }
            else {
                expect(res.status).toBe(400);
                expect(res.body.message).toMatch(/no se pudo enviar el correo|invitación creada/i);
            }
        });
    });
    describe('Flujo completo: invitación en BD + validate + register', () => {
        it('valida token, registra con invitación y crea membership', async () => {
            const emailForFlow = `flow-${Date.now()}@example.com`;
            const crypto = await import('node:crypto');
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const invitation = await Invitation.create({
                areaId: org.id,
                email: emailForFlow,
                role: 'gestor',
                tokenHash,
                invitedBy: adminAuth.user.id,
                status: 'pending',
                expiresAt,
            });
            const validateRes = await request(app)
                .post(`${API}/invitations/validate`)
                .send({ invitationId: invitation.id, token })
                .expect(200);
            expect(validateRes.body.data).toMatchObject({
                valid: true,
                email: emailForFlow,
                organizationId: org.id,
                organizationName: org.name,
                role: 'gestor',
            });
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            const registerRes = await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: emailForFlow,
                password: 'password123',
                name: 'Invitado',
                invitationId: invitation.id,
                token,
            })
                .expect(201);
            expect(registerRes.body.success).toBe(true);
            expect(registerRes.body.data.user).toMatchObject({
                email: emailForFlow,
                name: 'Invitado',
            });
            const membership = await Membership.findOne({
                where: {
                    userId: registerRes.body.data.user.id,
                    areaId: org.id,
                },
            });
            expect(membership).not.toBeNull();
            expect(membership?.role).toBe('gestor');
            expect(membership?.status).toBe('activo');
            const usedInvitation = await Invitation.findByPk(invitation.id);
            expect(usedInvitation?.status).toBe('accepted');
            expect(usedInvitation?.usedAt).not.toBeNull();
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
        it('registro sin invitación devuelve 400 cuando bypass desactivado', async () => {
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            const res = await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: `no-invite-${Date.now()}@example.com`,
                password: 'password123',
                name: 'Sin Invitación',
            })
                .expect(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invitación|invitationId|token/i);
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
        it('tras registrar por invitación (link) el usuario puede iniciar sesión sin verificar email', async () => {
            const emailLink = `link-${Date.now()}@example.com`;
            const crypto = await import('node:crypto');
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const invitation = await Invitation.create({
                areaId: org.id,
                email: emailLink,
                role: 'observador',
                tokenHash,
                invitedBy: adminAuth.user.id,
                status: 'pending',
                expiresAt,
            });
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            const registerRes = await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: emailLink,
                password: 'password123',
                name: 'Usuario Link',
                invitationId: invitation.id,
                token,
            })
                .expect(201);
            expect(registerRes.body.data.message).toMatch(/iniciar sesión|ya puedes/i);
            const loginRes = await request(app)
                .post(`${API}/auth/login`)
                .send({ email: emailLink, password: 'password123' })
                .expect(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body.data).toHaveProperty('accessToken');
            const user = await User.findByPk(registerRes.body.data.user.id);
            expect(user?.emailVerified).toBe(true);
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
    });
    describe('POST /invitations/verify-email/start y confirm + registro con invitationProof', () => {
        it('start devuelve 200; confirm con OTP correcto devuelve invitationProof; registro con proof permite login', async () => {
            const emailProof = `proof-${Date.now()}@example.com`;
            const crypto = await import('node:crypto');
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const invitation = await Invitation.create({
                areaId: org.id,
                email: emailProof,
                role: 'prestador',
                tokenHash,
                invitedBy: adminAuth.user.id,
                status: 'pending',
                expiresAt,
            });
            const otp = '123456';
            const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
            const otpExpiresAt = DateTime.now().plus({ minutes: 10 }).toJSDate();
            await InvitationEmailProof.create({
                invitationId: invitation.id,
                email: emailProof,
                otpHash,
                attempts: 0,
                maxAttempts: 5,
                otpExpiresAt,
            });
            const confirmRes = await request(app)
                .post(`${API}/invitations/verify-email/confirm`)
                .send({
                invitationId: invitation.id,
                email: emailProof,
                otp,
            })
                .expect(200);
            expect(confirmRes.body.data).toHaveProperty('invitationProof');
            const invitationProof = confirmRes.body.data.invitationProof;
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: emailProof,
                password: 'password123',
                name: 'Usuario Proof',
                invitationId: invitation.id,
                invitationProof,
            })
                .expect(201);
            const loginRes = await request(app)
                .post(`${API}/auth/login`)
                .send({ email: emailProof, password: 'password123' })
                .expect(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body.data).toHaveProperty('accessToken');
            const user = await User.findOne({ where: { email: emailProof } });
            expect(user?.emailVerified).toBe(true);
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
        it('registro con invitationId pero sin token ni invitationProof devuelve 400', async () => {
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            const res = await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: `noproof-${Date.now()}@example.com`,
                password: 'password123',
                name: 'No Proof',
                invitationId: '550e8400-e29b-41d4-a716-446655440000',
            })
                .expect(400);
            expect(res.body.success).toBe(false);
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
    });
    describe('Flujo onboarding: invitación sin dependencia', () => {
        it('valida invitación onboarding y registra usuario con onboardingStatus pending_setup', async () => {
            const emailOnboarding = `onboarding-${Date.now()}@example.com`;
            const crypto = await import('node:crypto');
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const onboardingInvitation = await OnboardingInvitation.create({
                email: emailOnboarding,
                tokenHash,
                invitedBy: adminAuth.user.id,
                status: 'pending',
                expiresAt,
            });
            const validateRes = await request(app)
                .post(`${API}/invitations/validate`)
                .send({ invitationId: onboardingInvitation.id, token })
                .expect(200);
            expect(validateRes.body.data).toMatchObject({
                valid: true,
                email: emailOnboarding,
                type: 'onboarding',
            });
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'false';
            const registerRes = await request(app)
                .post(`${API}/auth/register`)
                .send({
                email: emailOnboarding,
                password: 'password123',
                name: 'Usuario Onboarding',
                invitationId: onboardingInvitation.id,
                token,
            })
                .expect(201);
            expect(registerRes.body.success).toBe(true);
            const user = await User.findOne({ where: { email: emailOnboarding } });
            expect(user).not.toBeNull();
            expect(user?.emailVerified).toBe(true);
            expect(user?.onboardingStatus).toBe('pending_setup');
            const loginRes = await request(app)
                .post(`${API}/auth/login`)
                .send({ email: emailOnboarding, password: 'password123' })
                .expect(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body.data).toHaveProperty('accessToken');
            process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] = 'true';
        });
    });
});
//# sourceMappingURL=invitations.integration.test.js.map