import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import * as subscriptionLimitsService from '../subscription-limits.service.js';

const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID;
const PLAN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID;
const DEP_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID;

const mockAreaFindByPk = vi.fn();
const mockSubscriptionFindOne = vi.fn();
const mockSubscriptionCount = vi.fn();
const mockMembershipCount = vi.fn();
const mockEventoOperativoCount = vi.fn();
const mockActividadCount = vi.fn();
const mockGetPlanById = vi.fn();

vi.mock('@/modules/areas/models/area.model.js', () => ({
  Area: {
    findByPk: (...args: unknown[]): unknown => mockAreaFindByPk(...args),
    findAll: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription.model.js', () => ({
  Subscription: {
    findOne: (...args: unknown[]): unknown => mockSubscriptionFindOne(...args),
    count: (...args: unknown[]): unknown => mockSubscriptionCount(...args),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription-plan.model.js', () => ({
  SubscriptionPlan: {},
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

vi.mock('@/modules/subscriptions/services/subscription-plan.service.js', () => ({
  getPlanById: (...args: unknown[]): unknown => mockGetPlanById(...args),
}));

describe('subscription-limits.service', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    mockAreaFindByPk.mockResolvedValue({ id: ORG_ID, dependenciaId: DEP_ID });
    mockMembershipCount.mockResolvedValue(0);
    mockEventoOperativoCount.mockResolvedValue(0);
    mockActividadCount.mockResolvedValue(0);
  });

  const activeSubscriptionWithPlan = (plan: {
    id: UUID;
    name: string;
    maxUsers?: number | null;
    maxEventos?: number | null;
    maxActividades?: number | null;
    maxOrganizations?: number | null;
  }): unknown => ({
    organizationId: ORG_ID,
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 86400000),
    SubscriptionPlan: plan,
  });

  describe('getActiveSubscriptionByOrganization', () => {
    it('returns null when no area', async () => {
      mockAreaFindByPk.mockResolvedValueOnce(null);

      const result = await subscriptionLimitsService.getActiveSubscriptionByOrganization(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns null when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionLimitsService.getActiveSubscriptionByOrganization(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns subscription when active subscription exists', async () => {
      const sub = activeSubscriptionWithPlan({
        id: PLAN_ID,
        name: 'básico',
        maxUsers: 10,
        maxEventos: 100,
        maxActividades: 5,
        maxOrganizations: null,
      });
      mockSubscriptionFindOne.mockResolvedValueOnce(sub);

      const result = await subscriptionLimitsService.getActiveSubscriptionByOrganization(ORG_ID);

      expect(result).toEqual(sub);
    });
  });

  describe('getOrganizationLimits', () => {
    it('returns null when no active subscription or plan', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionLimitsService.getOrganizationLimits(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns limits when subscription and plan exist', async () => {
      const plan = {
        id: PLAN_ID,
        name: 'básico',
        maxUsers: 10,
        maxEventos: 100,
        maxActividades: 5,
        maxOrganizations: 50,
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(activeSubscriptionWithPlan(plan));

      const result = await subscriptionLimitsService.getOrganizationLimits(ORG_ID);

      expect(result).not.toBeNull();
      expect(result?.planId).toBe(PLAN_ID);
      expect(result?.planName).toBe('básico');
      expect(result?.maxUsers).toBe(10);
      expect(result?.maxEventos).toBe(100);
      expect(result?.maxActividades).toBe(5);
      expect(result?.maxOrganizations).toBe(50);
      expect(result).toHaveProperty('maxAreas');
      expect(result).toHaveProperty('maxPrestadores');
      expect(result).toHaveProperty('maxActivos');
    });

    it('returns maxAreas, maxPrestadores, maxActivos from features.limits when set', async () => {
      const plan = {
        id: PLAN_ID,
        name: 'profesional',
        maxUsers: 50,
        maxEventos: 5000,
        maxActividades: 40,
        maxOrganizations: null,
        features: { limits: { areas: 15, prestadores: 150, activos: 300 } },
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(activeSubscriptionWithPlan(plan));

      const result = await subscriptionLimitsService.getOrganizationLimits(ORG_ID);

      expect(result).not.toBeNull();
      expect(result?.maxAreas).toBe(15);
      expect(result?.maxPrestadores).toBe(150);
      expect(result?.maxActivos).toBe(300);
    });
  });

  describe('getOrganizationUsage', () => {
    it('returns usage counts without period bounds', async () => {
      mockMembershipCount.mockResolvedValue(3);
      mockEventoOperativoCount.mockResolvedValue(20);
      mockActividadCount.mockResolvedValue(2);

      const result = await subscriptionLimitsService.getOrganizationUsage(ORG_ID);

      expect(result).toEqual({
        usersCount: 3,
        eventosCount: 20,
        actividadesCount: 2,
      });
    });

    it('returns usage with period bounds for eventos', async () => {
      mockMembershipCount.mockResolvedValue(1);
      mockEventoOperativoCount.mockResolvedValue(5);
      mockActividadCount.mockResolvedValue(1);

      const periodStart = new Date('2025-02-01');
      const periodEnd = new Date('2025-02-28');
      const result = await subscriptionLimitsService.getOrganizationUsage(ORG_ID, {
        periodStart,
        periodEnd,
      });

      expect(result.usersCount).toBe(1);
      expect(result.eventosCount).toBe(5);
      expect(result.actividadesCount).toBe(1);
      expect(mockEventoOperativoCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.anything(),
          }),
        })
      );
    });
  });

  describe('getLimitsAndUsage', () => {
    it('returns null when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await subscriptionLimitsService.getLimitsAndUsage(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns limits and usage when subscription active', async () => {
      const plan = {
        id: PLAN_ID,
        name: 'básico',
        maxUsers: 10,
        maxEventos: 100,
        maxActividades: 5,
        maxOrganizations: null,
      };
      mockSubscriptionFindOne.mockResolvedValueOnce(activeSubscriptionWithPlan(plan));
      mockMembershipCount.mockResolvedValue(2);
      mockEventoOperativoCount.mockResolvedValue(10);
      mockActividadCount.mockResolvedValue(1);

      const result = await subscriptionLimitsService.getLimitsAndUsage(ORG_ID);

      expect(result).not.toBeNull();
      expect(result?.limits.planName).toBe('básico');
      expect(result?.usage.usersCount).toBe(2);
      expect(result?.usage.eventosCount).toBe(10);
      expect(result?.usage.actividadesCount).toBe(1);
    });
  });

  describe('checkUsersLimit', () => {
    it('throws NotFoundError when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('does not throw when plan has no maxUsers limit', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: null,
          maxActividades: null,
          maxOrganizations: null,
        })
      );

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID)).resolves.toBeUndefined();
    });

    it('throws ValidationError when usage >= maxUsers', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: 10,
          maxEventos: null,
          maxActividades: null,
          maxOrganizations: null,
        })
      );
      mockMembershipCount.mockResolvedValue(10);

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID)).rejects.toThrow(
        ValidationError
      );
    });

    it('does not throw when usage < maxUsers', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: 10,
          maxEventos: null,
          maxActividades: null,
          maxOrganizations: null,
        })
      );
      mockMembershipCount.mockResolvedValue(5);

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID)).resolves.toBeUndefined();
    });

    it('accepts currentCount override', async () => {
      const subWithLimit = activeSubscriptionWithPlan({
        id: PLAN_ID,
        name: 'básico',
        maxUsers: 10,
        maxEventos: null,
        maxActividades: null,
        maxOrganizations: null,
      });
      mockSubscriptionFindOne
        .mockResolvedValueOnce(subWithLimit)
        .mockResolvedValueOnce(subWithLimit);

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID, 9)).resolves.toBeUndefined();

      await expect(subscriptionLimitsService.checkUsersLimit(ORG_ID, 10)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('checkEventosLimit', () => {
    it('throws NotFoundError when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(subscriptionLimitsService.checkEventosLimit(ORG_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('does not throw when plan has no maxEventos limit', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: null,
          maxActividades: null,
          maxOrganizations: null,
        })
      );

      await expect(subscriptionLimitsService.checkEventosLimit(ORG_ID)).resolves.toBeUndefined();
    });

    it('throws ValidationError when eventos count >= maxEventos', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: 50,
          maxActividades: null,
          maxOrganizations: null,
        })
      );
      mockMembershipCount.mockResolvedValue(0);
      mockEventoOperativoCount.mockResolvedValue(50);
      mockActividadCount.mockResolvedValue(0);

      await expect(subscriptionLimitsService.checkEventosLimit(ORG_ID)).rejects.toThrow(
        ValidationError
      );
    });

    it('does not throw when currentCount passed and under limit', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: 100,
          maxActividades: null,
          maxOrganizations: null,
        })
      );

      await expect(
        subscriptionLimitsService.checkEventosLimit(ORG_ID, 50)
      ).resolves.toBeUndefined();
    });
  });

  describe('checkActividadesLimit', () => {
    it('throws NotFoundError when no active subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(subscriptionLimitsService.checkActividadesLimit(ORG_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('does not throw when plan has no maxActividades limit', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: null,
          maxActividades: null,
          maxOrganizations: null,
        })
      );

      await expect(
        subscriptionLimitsService.checkActividadesLimit(ORG_ID)
      ).resolves.toBeUndefined();
    });

    it('throws ValidationError when actividades count >= maxActividades', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(
        activeSubscriptionWithPlan({
          id: PLAN_ID,
          name: 'básico',
          maxUsers: null,
          maxEventos: null,
          maxActividades: 5,
          maxOrganizations: null,
        })
      );
      mockMembershipCount.mockResolvedValue(0);
      mockEventoOperativoCount.mockResolvedValue(0);
      mockActividadCount.mockResolvedValue(5);

      await expect(subscriptionLimitsService.checkActividadesLimit(ORG_ID)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('checkOrganizationsLimit', () => {
    it('does not throw when plan has no maxOrganizations limit', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        maxOrganizations: null,
      });

      await expect(
        subscriptionLimitsService.checkOrganizationsLimit(PLAN_ID)
      ).resolves.toBeUndefined();
    });

    it('throws ValidationError when count >= maxOrganizations', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        maxOrganizations: 10,
      });
      mockSubscriptionCount.mockResolvedValueOnce(10);

      await expect(subscriptionLimitsService.checkOrganizationsLimit(PLAN_ID)).rejects.toThrow(
        ValidationError
      );
    });

    it('does not throw when count < maxOrganizations', async () => {
      mockGetPlanById.mockResolvedValueOnce({
        id: PLAN_ID,
        maxOrganizations: 10,
      });
      mockSubscriptionCount.mockResolvedValueOnce(5);

      await expect(
        subscriptionLimitsService.checkOrganizationsLimit(PLAN_ID)
      ).resolves.toBeUndefined();
    });
  });
});
