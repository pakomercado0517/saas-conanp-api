import type { Application } from 'express';
import request from 'supertest';
import type { UUID } from '@/shared/database/types.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';

const API_PREFIX = '/api/v1';

export interface AuthResult {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Registra un usuario vía API y devuelve usuario y tokens.
 */
export async function createTestUserAndToken(
  app: Application,
  overrides?: { email?: string; password?: string; name?: string }
): Promise<AuthResult> {
  const email = overrides?.email ?? `test-${Date.now()}@example.com`;
  const password = overrides?.password ?? 'password123';
  const name = overrides?.name ?? 'Test User';
  const res = await request(app)
    .post(`${API_PREFIX}/auth/register`)
    .send({ email, password, name })
    .expect(201);
  const body = res.body as { success: boolean; data: AuthResult; message: string };
  if (!body.success || !body.data) throw new Error('Register failed');
  return body.data;
}

/**
 * Inicia sesión y devuelve tokens.
 */
export async function loginAs(
  app: Application,
  email: string,
  password: string
): Promise<AuthResult> {
  const res = await request(app)
    .post(`${API_PREFIX}/auth/login`)
    .send({ email, password })
    .expect(200);
  const body = res.body as { success: boolean; data: AuthResult; message: string };
  if (!body.success || !body.data) throw new Error('Login failed');
  return body.data;
}

export interface OrganizationData {
  id: string;
  name: string;
  ecosystem_type: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea una organización vía API (no requiere auth).
 */
export async function createTestOrganization(
  app: Application,
  body?: { name?: string; ecosystem_type?: 'terrestre' | 'maritimo' | 'mixto' }
): Promise<OrganizationData> {
  const res = await request(app)
    .post(`${API_PREFIX}/organizations`)
    .send({
      name: body?.name ?? `Org ${Date.now()}`,
      ecosystem_type: body?.ecosystem_type ?? 'terrestre',
    })
    .expect(201);
  const data = (res.body as { success: boolean; data: OrganizationData }).data;
  if (!data?.id) throw new Error('Create organization failed');
  return data;
}

/**
 * Bootstrap: solo añade membership (admin) a la organización vía BD, sin suscripción.
 * Útil para probar que los endpoints devuelven 403 cuando no hay suscripción activa.
 */
export async function bootstrapOrganizationMembershipOnly(
  userId: UUID,
  organizationId: UUID
): Promise<void> {
  await Membership.create({
    userId,
    organizationId,
    role: 'admin',
    status: 'activo',
  });
}

/**
 * Bootstrap: añade membership (admin) y suscripción activa a la organización vía BD.
 * Necesario porque las rutas que requieren organización exigen suscripción activa,
 * y no se puede invitar a nadie sin tener ya acceso (y por tanto suscripción).
 * Debe llamarse después de crear usuario (API) y organización (API).
 */
export async function bootstrapOrganizationWithSubscription(
  userId: UUID,
  organizationId: UUID
): Promise<void> {
  await bootstrapOrganizationMembershipOnly(userId, organizationId);

  let plan = await SubscriptionPlan.findOne({ where: { active: true } });
  if (!plan) {
    plan = await SubscriptionPlan.create({
      name: 'básico',
      description: 'Plan de pruebas',
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 10,
      maxEventos: 100,
      maxActividades: 20,
      active: true,
    });
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  await Subscription.create({
    organizationId,
    planId: plan.id,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    metadata: null,
  });
}

export interface MembershipData {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invita un usuario a la organización (requiere token con acceso admin y suscripción activa).
 */
export async function createMembership(
  app: Application,
  accessToken: string,
  organizationId: string,
  body: { userId: string; role: 'admin' | 'gestor' | 'prestador' | 'observador'; status?: string }
): Promise<MembershipData> {
  const res = await request(app)
    .post(`${API_PREFIX}/organizations/${organizationId}/memberships`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      userId: body.userId,
      role: body.role,
      status: body.status ?? 'activo',
    })
    .expect(201);
  const data = (res.body as { success: boolean; data: MembershipData }).data;
  if (!data?.id) throw new Error('Create membership failed');
  return data;
}

/**
 * Crea un perfil de prestador en la organización (requiere token admin y suscripción activa).
 */
export async function createPrestadorProfile(
  app: Application,
  accessToken: string,
  organizationId: string,
  body: { userId: string; status?: string }
): Promise<{ id: string; userId: string; organizationId: string; status: string }> {
  const res = await request(app)
    .post(`${API_PREFIX}/organizations/${organizationId}/prestadores`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      userId: body.userId,
      organizationId,
      status: body.status ?? 'activo',
    })
    .expect(201);
  const data = (
    res.body as {
      success: boolean;
      data: { id: string; userId: string; organizationId: string; status: string };
    }
  ).data;
  if (!data?.id) throw new Error('Create prestador profile failed');
  return data;
}

/** Retorno de authRequest: métodos HTTP que inyectan el Bearer token. */
type AuthRequestReturn = {
  get: (url: string) => ReturnType<ReturnType<typeof request>['get']>;
  post: (url: string) => ReturnType<ReturnType<typeof request>['post']>;
  patch: (url: string) => ReturnType<ReturnType<typeof request>['patch']>;
  delete: (url: string) => ReturnType<ReturnType<typeof request>['delete']>;
};

/**
 * Helper para peticiones autenticadas.
 * request(app) devuelve un objeto con .get, .post, etc.; .set() está en la cadena de cada método.
 * Por eso encadenamos el header en cada llamada a get/post/patch/delete.
 */
export function authRequest(app: Application, accessToken: string): AuthRequestReturn {
  const req = request(app);
  const withAuth = <T>(r: T & { set: (k: string, v: string) => T }): T =>
    accessToken ? r.set('Authorization', `Bearer ${accessToken}`) : r;
  return {
    get: (url: string) => withAuth(req.get(url)),
    post: (url: string) => withAuth(req.post(url)),
    patch: (url: string) => withAuth(req.patch(url)),
    delete: (url: string) => withAuth(req.delete(url)),
  };
}
