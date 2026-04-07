import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import { sequelize } from '@/shared/database/index.js';
import * as subscriptionService from '../subscription.service.js';

const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID;
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID;
const PLAN_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID;
const SUB_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd' as UUID;
const DEPENDENCIA_ID = '11111111-1111-1111-1111-111111111111' as UUID;

const mockAreaFindByPk = vi.fn();
const mockAreaFindAll = vi.fn();
const mockAreaFindOne = vi.fn();

const mockSubscriptionFindOne = vi.fn();
const mockSubscriptionCreate = vi.fn();
const mockSubscriptionFindAll = vi.fn();
const mockMembershipCount = vi.fn();
const mockEventoOperativoCount = vi.fn();
const mockActividadCount = vi.fn();
const mockOrganizationFindByPk = vi.fn();
const mockAssertIsAdmin = vi.fn();
const mockGetPlanById = vi.fn();
const mockGetPlanByStripePriceId = vi.fn();
const mockAssertPlanExistsAndActive = vi.fn();
const mockStripeCustomersCreate = vi.fn();
const mockStripeSubscriptionsCreate = vi.fn();
const mockStripeSubscriptionsRetrieve = vi.fn();
const mockStripeSubscriptionsUpdate = vi.fn();
const mockStripeSubscriptionsCancel = vi.fn();
const mockStripeCheckoutSessionsCreate = vi.fn();
const mockGetFreePlan = vi.fn();

vi.mock('@/shared/cache/index.js', () => ({
  cache: {
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockDependenciaFindByPk = vi.fn();

vi.mock('@/modules/dependencias/models/dependencia.model.js', () => ({
  Dependencia: {
    findByPk: (...args: unknown[]): unknown => mockDependenciaFindByPk(...args),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription.model.js', () => ({
  Subscription: {
    findOne: (...args: unknown[]): unknown => mockSubscriptionFindOne(...args),
    create: (...args: unknown[]): unknown => mockSubscriptionCreate(...args),
    findAll: (...args: unknown[]): unknown => mockSubscriptionFindAll(...args),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription-plan.model.js', () => ({
  SubscriptionPlan: {},
}));

vi.mock('@/modules/areas/models/area.model.js', () => ({
  Area: {
    findByPk: (...args: unknown[]): unknown => mockAreaFindByPk(...args),
    findAll: (...args: unknown[]): unknown => mockAreaFindAll(...args),
    findOne: (...args: unknown[]): unknown => mockAreaFindOne(...args),
  },
}));

vi.mock('@/modules/organizations/models/organization.model.js', () => ({
  Organization: {
    findByPk: (...args: unknown[]): unknown => mockOrganizationFindByPk(...args),
  },
}));

vi.mock('@/modules/users/models/membership.model.js', () => ({
  Membership: {
    count: (...args: unknown[]): unknown => mockMembershipCount(...args),
  },
}));

vi.mock('@/modules/eventos/models/evento-operativo.model.js', () => ({
  EventoOperativo: {
    count: (...args: unknown[]): unknown => mockEventoOperativoCount(...args),
  },
}));

vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
  Actividad: {
    count: (...args: unknown[]): unknown => mockActividadCount(...args),
  },
}));

vi.mock('@/modules/organizations/services/organization.service.js', () => ({
  assertCanAccessOrganization: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/modules/users/services/membership.service.js', () => ({
  assertIsAdmin: (...args: unknown[]): unknown => mockAssertIsAdmin(...args),
}));

vi.mock('@/modules/subscriptions/services/subscription-plan.service.js', () => ({
  getPlanById: (...args: unknown[]): unknown => mockGetPlanById(...args),
  getPlanByStripePriceId: (...args: unknown[]): unknown => mockGetPlanByStripePriceId(...args),
  assertPlanExistsAndActive: (...args: unknown[]): unknown =>
    mockAssertPlanExistsAndActive(...args),
  getFreePlan: (...args: unknown[]): unknown => mockGetFreePlan(...args),
}));

vi.mock('@/shared/stripe/index.js', () => ({
  stripeClient: {
    customers: {
      create: (...args: unknown[]): unknown => mockStripeCustomersCreate(...args),
    },
    subscriptions: {
      create: (...args: unknown[]): unknown => mockStripeSubscriptionsCreate(...args),
      retrieve: (...args: unknown[]): unknown => mockStripeSubscriptionsRetrieve(...args),
      update: (...args: unknown[]): unknown => mockStripeSubscriptionsUpdate(...args),
      cancel: (...args: unknown[]): unknown => mockStripeSubscriptionsCancel(...args),
    },
    checkout: {
      sessions: {
        create: (...args: unknown[]): unknown => mockStripeCheckoutSessionsCreate(...args),
      },
    },
  },
  handleStripeError: vi.fn().mockImplementation((err: unknown) => {
    throw err;
  }),
}));

vi.mock('@/shared/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));

describe('subscription.service', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    mockDependenciaFindByPk.mockResolvedValue({ id: DEPENDENCIA_ID });
    mockSubscriptionFindOne.mockReset();
    mockSubscriptionFindOne.mockResolvedValue(null);
    mockMembershipCount.mockResolvedValue(0);
    mockEventoOperativoCount.mockResolvedValue(0);
    mockActividadCount.mockResolvedValue(0);
    mockAreaFindByPk.mockResolvedValue({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
    mockAreaFindAll.mockResolvedValue([{ id: ORG_ID }]);
    mockAreaFindOne.mockResolvedValue({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
    mockGetFreePlan.mockResolvedValue({
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff' as UUID,
      name: 'free',
    });
    mockStripeSubscriptionsCancel.mockResolvedValue({ id: 'sub_canceled', status: 'canceled' });
    (sequelize.transaction as ReturnType<typeof vi.fn>).mockImplementation(
      (fn: (t: unknown) => Promise<unknown>) => fn({})
    );
  });

  describe('assertNoActiveSubscription', () => {
    it('throws ConflictError when active subscription exists', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        id: SUB_ID,
        organizationId: ORG_ID,
        status: 'active',
      });

      await expect(subscriptionService.assertNoActiveSubscription(ORG_ID)).rejects.toThrow(
        ConflictError
      );
    });

    it('does not throw when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(subscriptionService.assertNoActiveSubscription(ORG_ID)).resolves.toBeUndefined();
    });
  });

  describe('assertNoExistingSubscription', () => {
    it('throws ConflictError when any subscription exists', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        id: SUB_ID,
        organizationId: ORG_ID,
        status: 'canceled',
      });

      await expect(subscriptionService.assertNoExistingSubscription(ORG_ID)).rejects.toThrow(
        ConflictError
      );
    });

    it('does not throw when no subscription exists', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(
        subscriptionService.assertNoExistingSubscription(ORG_ID)
      ).resolves.toBeUndefined();
    });
  });

  describe('getOrganizationUsage', () => {
    it('returns counts for users, eventos, actividades', async () => {
      mockMembershipCount.mockResolvedValue(5);
      mockEventoOperativoCount.mockResolvedValue(20);
      mockActividadCount.mockResolvedValue(3);

      const result = await subscriptionService.getOrganizationUsage(ORG_ID);

      expect(result).toEqual({
        usersCount: 5,
        eventosCount: 20,
        actividadesCount: 3,
      });
    });
  });

  describe('assertPlanLimits', () => {
    it('throws ValidationError when users count >= maxUsers', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        maxUsers: 10,
        maxEventos: 100,
        maxActividades: 5,
      });
      mockMembershipCount.mockResolvedValue(10);
      mockEventoOperativoCount.mockResolvedValue(0);
      mockActividadCount.mockResolvedValue(0);

      await expect(subscriptionService.assertPlanLimits(PLAN_ID, ORG_ID)).rejects.toThrow(
        ValidationError
      );
    });

    it('does not throw when usage under limits', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        maxUsers: 10,
        maxEventos: 100,
        maxActividades: 5,
      });
      mockMembershipCount.mockResolvedValue(5);
      mockEventoOperativoCount.mockResolvedValue(50);
      mockActividadCount.mockResolvedValue(2);

      await expect(subscriptionService.assertPlanLimits(PLAN_ID, ORG_ID)).resolves.toBeUndefined();
    });
  });

  describe('getSubscriptionByOrganization', () => {
    it('returns null when no subscription', async () => {
      mockAssertIsAdmin.mockResolvedValueOnce(undefined);
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionService.getSubscriptionByOrganization(ORG_ID, USER_ID);

      expect(result).toBeNull();
    });

    it('returns subscription when found', async () => {
      const subRecord = {
        id: SUB_ID,
        organizationId: ORG_ID,
        status: 'active',
        Organization: {},
        SubscriptionPlan: {},
      };
      mockAssertIsAdmin.mockResolvedValueOnce(undefined);
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);

      const result = await subscriptionService.getSubscriptionByOrganization(ORG_ID, USER_ID);

      expect(result).toEqual(subRecord);
    });

    it('returns subscription when status is incomplete (UI puede mostrar CTA)', async () => {
      const subRecord = {
        id: SUB_ID,
        organizationId: ORG_ID,
        status: 'incomplete',
        Organization: {},
        SubscriptionPlan: {},
      };
      mockAssertIsAdmin.mockResolvedValueOnce(undefined);
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);

      const result = await subscriptionService.getSubscriptionByOrganization(ORG_ID, USER_ID);

      expect(result).toEqual(subRecord);
    });
  });

  describe('getSubscriptionById', () => {
    it('throws NotFoundError when subscription not found', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(subscriptionService.getSubscriptionById(SUB_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('returns subscription when found and user is admin', async () => {
      const subRecord = {
        id: SUB_ID,
        organizationId: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        Organization: {},
        SubscriptionPlan: {},
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);

      const result = await subscriptionService.getSubscriptionById(SUB_ID, USER_ID);

      expect(result).toEqual(subRecord);
    });
  });

  describe('createSubscriptionFromWebhook', () => {
    it('returns null when stripeSubscriptionId missing', async () => {
      const result = await subscriptionService.createSubscriptionFromWebhook({});

      expect(result).toBeNull();
    });

    it('returns null when dependenciaId missing in metadata', async () => {
      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_stripe123',
        metadata: {},
      });

      expect(result).toBeNull();
    });

    it('returns null when dependencia not found', async () => {
      mockDependenciaFindByPk.mockResolvedValueOnce(null);

      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_stripe123',
        metadata: { dependenciaId: DEPENDENCIA_ID, planId: PLAN_ID },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: { data: [{ price: { id: 'price_1' } }] },
      });

      expect(result).toBeNull();
    });

    it('creates or updates subscription when existing by stripeSubscriptionId', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        stripePriceIdMonthly: 'price_1',
        stripePriceIdYearly: 'price_2',
      });
      const existingSub = {
        id: SUB_ID,
        organizationId: ORG_ID,
        stripeSubscriptionId: 'sub_stripe123',
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(existingSub);

      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_stripe123',
        metadata: { dependenciaId: DEPENDENCIA_ID, planId: PLAN_ID },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: { data: [{ price: { id: 'price_1' } }] },
        customer: 'cus_1',
      });

      expect(result).toBeDefined();
    });

    it('updates FREE row by dependenciaId when Checkout creates new stripe subscription', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        stripePriceIdMonthly: 'price_1',
        stripePriceIdYearly: 'price_2',
      });
      const freeRow = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        stripeSubscriptionId: null,
        status: 'active',
        SubscriptionPlan: { name: 'free' },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(null).mockResolvedValueOnce(freeRow);
      (freeRow.reload as ReturnType<typeof vi.fn>).mockResolvedValue(freeRow);

      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_checkout_new',
        metadata: { dependenciaId: DEPENDENCIA_ID, planId: PLAN_ID },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: { data: [{ price: { id: 'price_1' } }] },
        customer: 'cus_checkout',
      });

      expect(mockSubscriptionCreate).not.toHaveBeenCalled();
      expect(freeRow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeSubscriptionId: 'sub_checkout_new',
          planId: PLAN_ID,
          status: 'active',
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateSubscriptionFromWebhook', () => {
    it('returns null when stripeSubscriptionId missing', async () => {
      const result = await subscriptionService.updateSubscriptionFromWebhook({});

      expect(result).toBeNull();
    });

    it('returns null when subscription not found in BD', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionService.updateSubscriptionFromWebhook({
        id: 'sub_stripe123',
        status: 'canceled',
      });

      expect(result).toBeNull();
    });

    it('updates subscription and returns it', async () => {
      const subRecord = {
        id: SUB_ID,
        organizationId: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        stripeSubscriptionId: 'sub_stripe123',
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);
      const reloaded = { ...subRecord, status: 'canceled' };
      (subRecord.reload as ReturnType<typeof vi.fn>).mockResolvedValue(reloaded);

      const result = await subscriptionService.updateSubscriptionFromWebhook({
        id: 'sub_stripe123',
        status: 'canceled',
      });

      expect(subRecord.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('renewSubscriptionPeriodFromWebhook', () => {
    it('returns null when billing_reason is not subscription_cycle', async () => {
      const result = await subscriptionService.renewSubscriptionPeriodFromWebhook({
        billing_reason: 'manual',
      });

      expect(result).toBeNull();
    });

    it('returns null when subscription not found', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionService.renewSubscriptionPeriodFromWebhook({
        billing_reason: 'subscription_cycle',
        subscription: 'sub_stripe123',
        period_start: Math.floor(Date.now() / 1000),
        period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
      });

      expect(result).toBeNull();
    });

    it('updates period and returns subscription', async () => {
      const subRecord = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);
      (subRecord.reload as ReturnType<typeof vi.fn>).mockResolvedValue(subRecord);

      const result = await subscriptionService.renewSubscriptionPeriodFromWebhook({
        billing_reason: 'subscription_cycle',
        subscription: 'sub_stripe123',
        period_start: Math.floor(Date.now() / 1000),
        period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
      });

      expect(subRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('markSubscriptionPastDueFromWebhook', () => {
    it('returns null when subscription not found', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionService.markSubscriptionPastDueFromWebhook({
        subscription: 'sub_stripe123',
      });

      expect(result).toBeNull();
    });

    it('updates status to past_due and returns subscription', async () => {
      const subRecord = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(subRecord);
      (subRecord.reload as ReturnType<typeof vi.fn>).mockResolvedValue(subRecord);

      const result = await subscriptionService.markSubscriptionPastDueFromWebhook({
        subscription: 'sub_stripe123',
      });

      expect(subRecord.update).toHaveBeenCalledWith({ status: 'past_due' });
      expect(result).toBeDefined();
    });
  });

  describe('handleTrialWillEndFromWebhook', () => {
    it('does not throw when subscription not found', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(
        subscriptionService.handleTrialWillEndFromWebhook({
          id: 'sub_stripe123',
          trial_end: Math.floor(Date.now() / 1000) + 86400,
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('isFreeSubscriptionEligibleForStripeUpgrade', () => {
    it('returns true for free plan without Stripe and active status', () => {
      expect(
        subscriptionService.isFreeSubscriptionEligibleForStripeUpgrade({
          status: 'active',
          stripeSubscriptionId: null,
          SubscriptionPlan: { name: 'free' },
        })
      ).toBe(true);
    });

    it('returns true for trialing status', () => {
      expect(
        subscriptionService.isFreeSubscriptionEligibleForStripeUpgrade({
          status: 'trialing',
          stripeSubscriptionId: null,
          SubscriptionPlan: { name: 'free' },
        })
      ).toBe(true);
    });

    it('returns false when plan is not free', () => {
      expect(
        subscriptionService.isFreeSubscriptionEligibleForStripeUpgrade({
          status: 'active',
          stripeSubscriptionId: null,
          SubscriptionPlan: { name: 'básico' },
        })
      ).toBe(false);
    });

    it('returns false when stripeSubscriptionId is set', () => {
      expect(
        subscriptionService.isFreeSubscriptionEligibleForStripeUpgrade({
          status: 'active',
          stripeSubscriptionId: 'sub_123',
          SubscriptionPlan: { name: 'free' },
        })
      ).toBe(false);
    });

    it('returns false when status is not active or trialing', () => {
      expect(
        subscriptionService.isFreeSubscriptionEligibleForStripeUpgrade({
          status: 'canceled',
          stripeSubscriptionId: null,
          SubscriptionPlan: { name: 'free' },
        })
      ).toBe(false);
    });
  });

  describe('releaseIncompleteSubscriptionForRetry', () => {
    it('throws BadRequestError when subscription is not elegible', async () => {
      await expect(
        subscriptionService.releaseIncompleteSubscriptionForRetry({
          id: SUB_ID,
          dependenciaId: DEPENDENCIA_ID,
          status: 'active',
          stripeSubscriptionId: 'sub_x',
          SubscriptionPlan: { name: 'básico' },
          update: vi.fn(),
          reload: vi.fn(),
        } as never)
      ).rejects.toThrow(BadRequestError);
      expect(mockStripeSubscriptionsCancel).not.toHaveBeenCalled();
    });

    it('cancels Stripe sub, updates row to FREE and reloads', async () => {
      const reloaded = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        stripeSubscriptionId: null,
        SubscriptionPlan: { name: 'free' },
      };
      const sub = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'incomplete',
        stripeSubscriptionId: 'sub_inc',
        stripeCustomerId: 'cus_keep',
        SubscriptionPlan: { name: 'básico' },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(reloaded),
      };

      const result = await subscriptionService.releaseIncompleteSubscriptionForRetry(sub as never);

      expect(mockStripeSubscriptionsCancel).toHaveBeenCalledWith('sub_inc');
      expect(sub.update).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
          status: 'active',
          stripeSubscriptionId: null,
          stripePriceId: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        })
      );
      expect(sub.reload).toHaveBeenCalled();
      expect(result).toEqual(reloaded);
    });

    it('ignores Stripe resource_missing on cancel (idempotente)', async () => {
      const stripeErr = new Stripe.errors.StripeInvalidRequestError({
        message: 'No such subscription',
        type: 'invalid_request_error',
      });
      Object.assign(stripeErr, { code: 'resource_missing' });
      mockStripeSubscriptionsCancel.mockRejectedValueOnce(stripeErr);

      const reloaded = { id: SUB_ID, dependenciaId: DEPENDENCIA_ID };
      const sub = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'incomplete_expired',
        stripeSubscriptionId: 'sub_gone',
        SubscriptionPlan: { name: 'básico' },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(reloaded),
      };

      await subscriptionService.releaseIncompleteSubscriptionForRetry(sub as never);

      expect(sub.update).toHaveBeenCalled();
    });
  });

  describe('releaseIncompleteSubscriptionById', () => {
    it('throws BadRequestError when row is not incomplete-eligible', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        stripeSubscriptionId: 'sub_x',
        SubscriptionPlan: { name: 'básico' },
      });

      await expect(
        subscriptionService.releaseIncompleteSubscriptionById(SUB_ID, USER_ID)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('createSubscriptionCheckoutSession', () => {
    const PAID_PLAN_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' as UUID;
    const checkoutDto = {
      planId: PAID_PLAN_ID,
      billingCycle: 'monthly' as const,
    };

    it('returns url and sessionId from Stripe Checkout', async () => {
      mockAssertIsAdmin.mockResolvedValue(undefined);
      mockAreaFindByPk.mockResolvedValueOnce({
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Área demo',
      });
      mockSubscriptionFindOne.mockResolvedValueOnce(null);
      mockAssertPlanExistsAndActive.mockResolvedValue({
        id: PAID_PLAN_ID,
        name: 'básico',
        active: true,
        stripePriceIdMonthly: 'price_m',
        stripePriceIdYearly: 'price_y',
      });
      mockGetPlanById.mockResolvedValue({
        id: PAID_PLAN_ID,
        maxUsers: 100,
        maxEventos: 1000,
        maxActividades: 50,
      });
      mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_chk' });
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      });

      const result = await subscriptionService.createSubscriptionCheckoutSession(
        checkoutDto,
        ORG_ID,
        USER_ID
      );

      expect(result).toEqual({
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        sessionId: 'cs_test_123',
      });
      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_chk',
          line_items: [{ price: 'price_m', quantity: 1 }],
        })
      );
    });

    it('libera incomplete con sub en Stripe y crea Checkout sin ConflictError', async () => {
      const PAID_PLAN_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' as UUID;
      const checkoutDto = {
        planId: PAID_PLAN_ID,
        billingCycle: 'monthly' as const,
      };

      mockAssertIsAdmin.mockResolvedValue(undefined);
      mockAreaFindByPk.mockResolvedValueOnce({
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Área demo',
      });

      const freeAfterRelease = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        stripeSubscriptionId: null,
        stripeCustomerId: 'cus_keep',
        status: 'active',
        SubscriptionPlan: { name: 'free' },
      };
      const incompleteSub = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        status: 'incomplete' as const,
        stripeSubscriptionId: 'sub_inc',
        stripeCustomerId: 'cus_keep',
        SubscriptionPlan: { name: 'básico' },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(freeAfterRelease),
      };

      mockSubscriptionFindOne
        .mockResolvedValueOnce(incompleteSub)
        .mockResolvedValueOnce(freeAfterRelease);

      mockAssertPlanExistsAndActive.mockResolvedValue({
        id: PAID_PLAN_ID,
        name: 'básico',
        active: true,
        stripePriceIdMonthly: 'price_m',
        stripePriceIdYearly: 'price_y',
      });
      mockGetPlanById.mockResolvedValue({
        id: PAID_PLAN_ID,
        maxUsers: 100,
        maxEventos: 1000,
        maxActividades: 50,
      });
      mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_chk' });
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_retry',
        url: 'https://checkout.stripe.com/pay/cs_retry',
      });

      const result = await subscriptionService.createSubscriptionCheckoutSession(
        checkoutDto,
        ORG_ID,
        USER_ID
      );

      expect(mockStripeSubscriptionsCancel).toHaveBeenCalledWith('sub_inc');
      expect(incompleteSub.update).toHaveBeenCalled();
      expect(result.sessionId).toBe('cs_retry');
    });
  });

  describe('createSubscription', () => {
    const PAID_PLAN_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' as UUID;
    const createDto = {
      planId: PAID_PLAN_ID,
      billingCycle: 'monthly' as const,
    };

    it('upgrades FREE row to paid: Stripe + update, no Subscription.create', async () => {
      mockAssertIsAdmin.mockResolvedValue(undefined);
      mockAreaFindByPk.mockResolvedValueOnce({
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Área demo',
      });

      const reloaded = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        planId: PAID_PLAN_ID,
        status: 'active',
      };
      const freeSub = {
        id: SUB_ID,
        dependenciaId: DEPENDENCIA_ID,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        status: 'active',
        SubscriptionPlan: { name: 'free' },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(reloaded),
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(freeSub);

      mockAssertPlanExistsAndActive.mockResolvedValue({
        id: PAID_PLAN_ID,
        name: 'básico',
        active: true,
      });
      mockGetPlanById.mockResolvedValue({
        id: PAID_PLAN_ID,
        name: 'básico',
        maxUsers: 100,
        maxEventos: 1000,
        maxActividades: 50,
        stripePriceIdMonthly: 'price_m',
        stripePriceIdYearly: 'price_y',
      });

      mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_new' });
      const now = Math.floor(Date.now() / 1000);
      mockStripeSubscriptionsCreate.mockResolvedValue({
        id: 'sub_new',
        status: 'active',
        current_period_start: now,
        current_period_end: now + 30 * 86400,
        customer: 'cus_new',
        trial_end: null,
      });

      const result = await subscriptionService.createSubscription(createDto, ORG_ID, USER_ID);

      expect(mockSubscriptionCreate).not.toHaveBeenCalled();
      expect(freeSub.update).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: PAID_PLAN_ID,
          stripeSubscriptionId: 'sub_new',
          status: 'active',
        })
      );
      expect(freeSub.reload).toHaveBeenCalled();
      expect(result).toEqual(reloaded);
    });

    it('throws ConflictError when existing subscription is not FREE-upgradeable', async () => {
      mockAssertIsAdmin.mockResolvedValue(undefined);
      mockAreaFindByPk.mockResolvedValueOnce({
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Área',
      });
      mockSubscriptionFindOne.mockResolvedValueOnce({
        id: SUB_ID,
        status: 'active',
        stripeSubscriptionId: 'sub_existing',
        SubscriptionPlan: { name: 'free' },
      });

      await expect(
        subscriptionService.createSubscription(createDto, ORG_ID, USER_ID)
      ).rejects.toThrow(ConflictError);
      expect(mockAssertPlanExistsAndActive).not.toHaveBeenCalled();
    });

    it('throws ValidationError when target plan is free', async () => {
      mockAssertIsAdmin.mockResolvedValue(undefined);
      mockAreaFindByPk.mockResolvedValueOnce({
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Área',
      });
      mockSubscriptionFindOne.mockResolvedValueOnce(null);
      mockAssertPlanExistsAndActive.mockResolvedValue({
        id: PLAN_ID,
        name: 'free',
        active: true,
      });

      await expect(
        subscriptionService.createSubscription(
          { planId: PLAN_ID, billingCycle: 'monthly' },
          ORG_ID,
          USER_ID
        )
      ).rejects.toThrow(ValidationError);
    });
  });
});
