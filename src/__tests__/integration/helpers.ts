import type { Application } from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';
import type { UUID } from '@/shared/database/types.js';
import { User } from '@/modules/users/models/user.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { Invitation } from '@/modules/users/models/invitation.model.js';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';

const API_PREFIX = '/api/v1';
const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Registra un usuario vía API, lo marca como verificado y hace login para devolver tokens.
 * En test con ALLOW_REGISTER_WITHOUT_INVITATION=1 no requiere invitación (para tests existentes).
 * Sin bypass: usa invitationId y token (crear invitación antes vía API o con createTestInvitationInDb).
 */
export async function createTestUserAndToken(
  app: Application,
  overrides?: { email?: string; password?: string; name?: string }
): Promise<AuthResult> {
  const email = overrides?.email ?? `test-${Date.now()}@example.com`;
  const password = overrides?.password ?? 'password123';
  const name = overrides?.name ?? 'Test User';

  const useBypass =
    process.env['NODE_ENV'] === 'test' &&
    process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] === 'true';

  const payload = useBypass
    ? { email, password, name }
    : await getRegisterPayloadWithInvitation(app, email);

  const res = await request(app).post(`${API_PREFIX}/auth/register`).send(payload).expect(201);
  const body = res.body as {
    success: boolean;
    data: { user: AuthResult['user']; message?: string };
    message: string;
  };
  if (!body.success || !body.data?.user) throw new Error('Register failed');
  const userId = body.data.user.id;

  await User.update(
    { emailVerified: true, emailVerificationToken: null, emailVerificationExpiresAt: null },
    { where: { id: userId } }
  );

  return loginAs(app, email, password);
}

/**
 * Crea en BD una org con suscripción, un usuario admin y una invitación para el email dado.
 * Devuelve { invitationId, token } para usar en register. Usado por createTestUserAndToken cuando no hay bypass.
 */
async function getRegisterPayloadWithInvitation(
  _app: Application,
  email: string
): Promise<{ email: string; password: string; name: string; invitationId: string; token: string }> {
  const crypto = await import('node:crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);

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

  const dependencia = await Dependencia.create({
    name: `Org Invitation ${Date.now()}`,
    settings: {},
  });
  const area = await Area.create({
    dependenciaId: dependencia.id,
    name: dependencia.name,
    ecosystem_type: 'terrestre',
    settings: {},
  });

  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  await Subscription.create({
    dependenciaId: dependencia.id,
    planId: plan.id,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: new Date(),
    currentPeriodEnd: periodEnd,
    metadata: null,
  });

  const [adminUser] = await User.findOrCreate({
    where: { email: 'test-inviter@example.com' },
    defaults: {
      email: 'test-inviter@example.com',
      password: await bcrypt.hash('password123', BCRYPT_ROUNDS),
      name: 'Test Inviter',
      emailVerified: true,
    },
  });

  const [_adminMembership] = await Membership.findOrCreate({
    where: { userId: adminUser.id, areaId: area.id },
    defaults: {
      userId: adminUser.id,
      areaId: area.id,
      role: 'admin',
      status: 'activo',
    },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await Invitation.create({
    areaId: area.id,
    email: email.trim().toLowerCase(),
    role: 'prestador',
    tokenHash,
    invitedBy: adminUser.id,
    status: 'pending',
    expiresAt,
  });

  return {
    email,
    password: 'password123',
    name: 'Test User',
    invitationId: invitation.id,
    token,
  };
}

/**
 * Extrae el valor de una cookie del header Set-Cookie
 */
function getCookieValue(
  setCookieHeader: string[] | string | undefined,
  name: string
): string | undefined {
  const arr = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : typeof setCookieHeader === 'string'
      ? [setCookieHeader]
      : [];
  const line = arr.find((s) => s.startsWith(`${name}=`));
  if (!line) return undefined;
  const part = line.split(';')[0];
  if (!part) return undefined;
  const eq = part.indexOf('=');
  return eq === -1 ? undefined : part.slice(eq + 1);
}

/**
 * Inicia sesión y devuelve tokens. El refresh token viene en cookie; se extrae para usarlo en refresh/logout.
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
  const body = res.body as {
    success: boolean;
    data: { user: AuthResult['user']; accessToken: string; expiresIn: number };
    message: string;
  };
  if (!body.success || !body.data) throw new Error('Login failed');
  const setCookie = res.headers['set-cookie'];
  const refreshToken = getCookieValue(
    Array.isArray(setCookie) ? setCookie : typeof setCookie === 'string' ? [setCookie] : undefined,
    'refresh_token'
  );
  if (!refreshToken) throw new Error('Login response missing refresh_token cookie');
  return {
    user: body.data.user,
    accessToken: body.data.accessToken,
    refreshToken,
    expiresIn: body.data.expiresIn,
  };
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
 * Crea una organización. En test usa BD directamente para no depender de super admin.
 */
export async function createTestOrganization(
  app: Application,
  body?: { name?: string; ecosystem_type?: 'terrestre' | 'maritimo' | 'mixto' }
): Promise<OrganizationData> {
  const name = body?.name ?? `Org ${Date.now()}`;
  const ecosystem_type = body?.ecosystem_type ?? 'terrestre';

  if (process.env['NODE_ENV'] === 'test') {
    const dependencia = await Dependencia.create({ name, settings: {} });
    const area = await Area.create({
      dependenciaId: dependencia.id,
      name,
      ecosystem_type,
      settings: {},
    });
    return area.toJSON() as unknown as OrganizationData;
  }

  const res = await request(app)
    .post(`${AREAS_API_PREFIX}`)
    .send({ name, ecosystem_type })
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
    areaId: organizationId,
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

  const area = await Area.findByPk(organizationId);
  if (!area) throw new Error('Area not found for organizationId (areaId): ' + organizationId);
  await Subscription.create({
    dependenciaId: area.dependenciaId,
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
  areaId: string;
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
    .post(`${AREAS_API_PREFIX}/${organizationId}/memberships`)
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
    .post(`${AREAS_API_PREFIX}/${organizationId}/prestadores`)
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

/** Prefijo de rutas de áreas (recomendado). Compatible también con /api/v1/organizations. */
export const AREAS_API_PREFIX = `${API_PREFIX}/areas`;

/** Prefijo de rutas de organizaciones (compatibilidad). */
export const ORGANIZATIONS_API_PREFIX = `${API_PREFIX}/organizations`;

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
