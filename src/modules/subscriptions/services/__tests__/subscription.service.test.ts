import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import * as subscriptionService from '../subscription.service.js';

const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID;
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID;
const PLAN_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID;
const SUB_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd' as UUID;

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
const mockSequelizeTransaction = vi.fn();
const mockStripeCustomersCreate = vi.fn();
const mockStripeSubscriptionsCreate = vi.fn();
const mockStripeSubscriptionsRetrieve = vi.fn();
const mockStripeSubscriptionsUpdate = vi.fn();

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
}));

vi.mock('@/shared/database/index.js', () => ({
  sequelize: {
    transaction: (...args: unknown[]): unknown => mockSequelizeTransaction(...args),
  },
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
    },
  },
  handleStripeError: vi.fn().mockImplementation((err: unknown) => {
    throw err;
  }),
}));

vi.mock('@/shared/logger/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));

describe('subscription.service', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    mockMembershipCount.mockResolvedValue(0);
    mockEventoOperativoCount.mockResolvedValue(0);
    mockActividadCount.mockResolvedValue(0);
    mockSequelizeTransaction.mockImplementation((fn: (t: unknown) => Promise<unknown>) => fn({}));
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

    it('returns null when organizationId missing in metadata', async () => {
      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_stripe123',
        metadata: {},
      });

      expect(result).toBeNull();
    });

    it('returns null when organization not found', async () => {
      mockOrganizationFindByPk.mockResolvedValueOnce(null);

      const result = await subscriptionService.createSubscriptionFromWebhook({
        id: 'sub_stripe123',
        metadata: { organizationId: ORG_ID, planId: PLAN_ID },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: { data: [{ price: { id: 'price_1' } }] },
      });

      expect(result).toBeNull();
    });

    it('creates or updates subscription when existing by stripeSubscriptionId', async () => {
      mockOrganizationFindByPk.mockResolvedValueOnce({ id: ORG_ID, name: 'Org' });
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
        metadata: { organizationId: ORG_ID, planId: PLAN_ID },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: { data: [{ price: { id: 'price_1' } }] },
        customer: 'cus_1',
      });

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
});
