import request from 'supertest';
import { Membership } from '../../modules/users/models/membership.model.js';
import { SubscriptionPlan } from '../../modules/subscriptions/models/subscription-plan.model.js';
import { Subscription } from '../../modules/subscriptions/models/subscription.model.js';
const API_PREFIX = '/api/v1';
/**
 * Registra un usuario vía API y devuelve usuario y tokens.
 */
export async function createTestUserAndToken(app, overrides) {
    const email = overrides?.email ?? `test-${Date.now()}@example.com`;
    const password = overrides?.password ?? 'password123';
    const name = overrides?.name ?? 'Test User';
    const res = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({ email, password, name })
        .expect(201);
    const body = res.body;
    if (!body.success || !body.data)
        throw new Error('Register failed');
    return body.data;
}
/**
 * Inicia sesión y devuelve tokens.
 */
export async function loginAs(app, email, password) {
    const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ email, password })
        .expect(200);
    const body = res.body;
    if (!body.success || !body.data)
        throw new Error('Login failed');
    return body.data;
}
/**
 * Crea una organización vía API (no requiere auth).
 */
export async function createTestOrganization(app, body) {
    const res = await request(app)
        .post(`${API_PREFIX}/organizations`)
        .send({
        name: body?.name ?? `Org ${Date.now()}`,
        ecosystem_type: body?.ecosystem_type ?? 'terrestre',
    })
        .expect(201);
    const data = res.body.data;
    if (!data?.id)
        throw new Error('Create organization failed');
    return data;
}
/**
 * Bootstrap: solo añade membership (admin) a la organización vía BD, sin suscripción.
 * Útil para probar que los endpoints devuelven 403 cuando no hay suscripción activa.
 */
export async function bootstrapOrganizationMembershipOnly(userId, organizationId) {
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
export async function bootstrapOrganizationWithSubscription(userId, organizationId) {
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
/**
 * Invita un usuario a la organización (requiere token con acceso admin y suscripción activa).
 */
export async function createMembership(app, accessToken, organizationId, body) {
    const res = await request(app)
        .post(`${API_PREFIX}/organizations/${organizationId}/memberships`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
        userId: body.userId,
        role: body.role,
        status: body.status ?? 'activo',
    })
        .expect(201);
    const data = res.body.data;
    if (!data?.id)
        throw new Error('Create membership failed');
    return data;
}
/**
 * Crea un perfil de prestador en la organización (requiere token admin y suscripción activa).
 */
export async function createPrestadorProfile(app, accessToken, organizationId, body) {
    const res = await request(app)
        .post(`${API_PREFIX}/organizations/${organizationId}/prestadores`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
        userId: body.userId,
        organizationId,
        status: body.status ?? 'activo',
    })
        .expect(201);
    const data = res.body.data;
    if (!data?.id)
        throw new Error('Create prestador profile failed');
    return data;
}
/**
 * Helper para peticiones autenticadas.
 * request(app) devuelve un objeto con .get, .post, etc.; .set() está en la cadena de cada método.
 * Por eso encadenamos el header en cada llamada a get/post/patch/delete.
 */
export function authRequest(app, accessToken) {
    const req = request(app);
    const withAuth = (r) => accessToken ? r.set('Authorization', `Bearer ${accessToken}`) : r;
    return {
        get: (url) => withAuth(req.get(url)),
        post: (url) => withAuth(req.post(url)),
        patch: (url) => withAuth(req.patch(url)),
        delete: (url) => withAuth(req.delete(url)),
    };
}
//# sourceMappingURL=helpers.js.map