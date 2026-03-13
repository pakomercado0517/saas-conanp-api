import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/server.js';
import { createTestUserAndToken, loginAs, type AuthResult } from './helpers.js';

const API = '/api/v1/auth';

describe('Auth endpoints (integration)', () => {
  let auth: AuthResult;

  beforeAll(async () => {
    auth = await createTestUserAndToken(app);
  });

  describe('POST /register', () => {
    it('devuelve 201 y user + message (sin tokens) al registrar con datos válidos', async () => {
      const email = `new-${Date.now()}@example.com`;
      const res = await request(app)
        .post(`${API}/register`)
        .send({ email, password: 'password123', name: 'New User' })
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toMatchObject({ email, name: 'New User' });
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('message');
      expect(res.body.data).not.toHaveProperty('accessToken');
      expect(res.body.data).not.toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('message');
    });

    it('devuelve 400 con body inválido', async () => {
      await request(app)
        .post(`${API}/register`)
        .send({ email: 'invalid', password: 'short', name: '' })
        .expect(400);
    });
  });

  describe('POST /login', () => {
    it('devuelve 200, accessToken en body y refresh_token en cookie httpOnly', async () => {
      const res = await request(app)
        .post(`${API}/login`)
        .send({ email: auth.user.email, password: 'password123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).not.toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(auth.user.email);
      const setCookie = res.headers['set-cookie'];
      const cookieArr = Array.isArray(setCookie)
        ? setCookie
        : typeof setCookie === 'string'
          ? [setCookie]
          : [];
      expect(cookieArr.length).toBeGreaterThan(0);
      expect(cookieArr.some((c: string) => c.startsWith('refresh_token='))).toBe(true);
      expect(cookieArr.some((c: string) => c.includes('HttpOnly'))).toBe(true);
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
      await request(app)
        .post(`${API}/login`)
        .send({ email: auth.user.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('devuelve 401 cuando el correo no está verificado', async () => {
      const email = `unverified-${Date.now()}@example.com`;
      await request(app)
        .post(`${API}/register`)
        .send({ email, password: 'password123', name: 'Unverified User' })
        .expect(201);

      const res = await request(app)
        .post(`${API}/login`)
        .send({ email, password: 'password123' })
        .expect(401);

      expect(res.body.message || res.body.error).toMatch(/verificar/i);
    });
  });

  describe('POST /refresh', () => {
    it('devuelve 200 y nuevo accessToken cuando se envía la cookie refresh_token', async () => {
      const res = await request(app)
        .post(`${API}/refresh`)
        .set('Cookie', `refresh_token=${auth.refreshToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('expiresIn');
    });

    it('devuelve 401 sin cookie refresh_token', async () => {
      await request(app).post(`${API}/refresh`).expect(401);
    });
  });

  describe('GET /me', () => {
    it('devuelve 200 y userId/email con token válido', async () => {
      const res = await request(app)
        .get(`${API}/me`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        userId: auth.user.id,
        email: auth.user.email,
      });
    });

    it('devuelve 401 sin Authorization', async () => {
      await request(app).get(`${API}/me`).expect(401);
    });
  });

  describe('GET /verify-email', () => {
    it('devuelve 200 al verificar con token válido', async () => {
      // Registrar usuario nuevo (sin verificar)
      const email = `verify-${Date.now()}@example.com`;
      await request(app)
        .post(`${API}/register`)
        .send({ email, password: 'password123', name: 'Verify User' })
        .expect(201);

      // Obtener el token de la BD (en tests no enviamos email real)
      const { User } = await import('@/modules/users/models/user.model.js');
      const user = await User.findOne({ where: { email } });
      expect(user).toBeTruthy();
      expect(user?.emailVerificationToken).toBeTruthy();

      // Para verificar necesitamos el token en plain - en producción viene del email
      // En el service guardamos el hash; para el test inyectamos un token conocido
      const bcrypt = (await import('bcrypt')).default;
      const plainToken = 'test-verification-token-12345';
      const hashedToken = await bcrypt.hash(plainToken, 10);
      await user!.update({
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const res = await request(app)
        .get(`${API}/verify-email`)
        .query({ token: plainToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);

      // Verificar que el usuario quedó verificado
      await user!.reload();
      expect(user!.emailVerified).toBe(true);
      expect(user!.emailVerificationToken).toBeNull();
    });

    it('devuelve 400 con token inválido', async () => {
      await request(app).get(`${API}/verify-email`).query({ token: 'invalid-token' }).expect(400);
    });
  });

  describe('POST /resend-verification', () => {
    it('devuelve 200 (respuesta genérica por seguridad)', async () => {
      const res = await request(app)
        .post(`${API}/resend-verification`)
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sent).toBe(true);
    });
  });

  describe('POST /logout', () => {
    it('devuelve 204 y limpia la cookie cuando se envía la cookie refresh_token', async () => {
      const loggedIn = await loginAs(app, auth.user.email, 'password123');
      const res = await request(app)
        .post(`${API}/logout`)
        .set('Cookie', `refresh_token=${loggedIn.refreshToken}`)
        .expect(204);
      const setCookie = res.headers['set-cookie'];
      const cookieArr = Array.isArray(setCookie)
        ? setCookie
        : typeof setCookie === 'string'
          ? [setCookie]
          : [];
      expect(cookieArr.length).toBeGreaterThan(0);
      expect(cookieArr[0]?.toLowerCase().includes('max-age=0') ?? false).toBe(true);
    });
  });
});
