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
    it('devuelve 201 y user + tokens al registrar con datos válidos', async () => {
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
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('expiresIn');
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
    it('devuelve 200 y tokens con credenciales correctas', async () => {
      const res = await request(app)
        .post(`${API}/login`)
        .send({ email: auth.user.email, password: 'password123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(auth.user.email);
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
      await request(app)
        .post(`${API}/login`)
        .send({ email: auth.user.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('POST /refresh', () => {
    it('devuelve 200 y nuevo accessToken con refreshToken válido', async () => {
      const res = await request(app)
        .post(`${API}/refresh`)
        .send({ refreshToken: auth.refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('expiresIn');
    });

    it('devuelve 401 con refreshToken inválido', async () => {
      await request(app).post(`${API}/refresh`).send({ refreshToken: 'invalid-token' }).expect(401);
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

  describe('POST /logout', () => {
    it('devuelve 204 con refreshToken válido', async () => {
      const loggedIn = await loginAs(app, auth.user.email, 'password123');
      await request(app)
        .post(`${API}/logout`)
        .send({ refreshToken: loggedIn.refreshToken })
        .expect(204);
    });
  });
});
