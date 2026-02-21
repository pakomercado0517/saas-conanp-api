import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import app from '@/server.js';
import request from 'supertest';
import {
  createTestUserAndToken,
  createTestOrganization,
  bootstrapOrganizationWithSubscription,
  authRequest,
  type AuthResult,
  type OrganizationData,
} from './helpers.js';
import { Invitation } from '@/modules/users/models/invitation.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';

const API = '/api/v1';

describe('Invitaciones y registro con invitación (integration)', () => {
  let adminAuth: AuthResult;
  let org: OrganizationData;
  const invitedEmail = `invited-${Date.now()}@example.com`;
  const BCRYPT_ROUNDS = 10;

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

  describe('POST /organizations/:organizationId/invitations', () => {
    it('crea invitación y devuelve 201 (email puede fallar en test)', async () => {
      const res = await authRequest(app, adminAuth.accessToken)
        .post(`${API}/organizations/${org.id}/invitations`)
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
      } else {
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
        organizationId: org.id,
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
          userId: (registerRes.body.data.user as { id: string }).id,
          organizationId: org.id,
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
  });
});
