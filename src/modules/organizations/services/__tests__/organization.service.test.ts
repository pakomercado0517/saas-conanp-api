import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenError, NotFoundError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import * as organizationService from '../organization.service.js';

const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID;
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID;
const PLAN_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID;
const DEPENDENCIA_ID = '11111111-1111-1111-1111-111111111111' as UUID;

const mockMembershipFindOne = vi.fn();
const mockMembershipFindAll = vi.fn();
const mockSubscriptionFindOne = vi.fn();
const mockAreaFindByPk = vi.fn();
const mockAreaFindAndCountAll = vi.fn();
const mockAreaCreate = vi.fn();
const mockDependenciaCreate = vi.fn();

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();
const mockCacheDel = vi.fn();

vi.mock('@/shared/cache/index.js', () => ({
  cache: {
    get: (...args: unknown[]): unknown => mockCacheGet(...args),
    set: (...args: unknown[]): unknown => mockCacheSet(...args),
    del: (...args: unknown[]): unknown => mockCacheDel(...args),
  },
}));

vi.mock('@/modules/users/models/membership.model.js', () => ({
  Membership: {
    findOne: (...args: unknown[]): unknown => mockMembershipFindOne(...args),
    findAll: (...args: unknown[]): unknown => mockMembershipFindAll(...args),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription.model.js', () => ({
  Subscription: {
    findOne: (...args: unknown[]): unknown => mockSubscriptionFindOne(...args),
  },
}));

vi.mock('@/modules/subscriptions/models/subscription-plan.model.js', () => ({
  SubscriptionPlan: {},
}));

vi.mock('@/modules/organizations/models/organization.model.js', () => ({
  Organization: {},
}));

vi.mock('@/modules/areas/models/area.model.js', () => ({
  Area: {
    findByPk: (...args: unknown[]): unknown => mockAreaFindByPk(...args),
    findAndCountAll: (...args: unknown[]): unknown => mockAreaFindAndCountAll(...args),
    create: (...args: unknown[]): unknown => mockAreaCreate(...args),
  },
}));

vi.mock('@/modules/dependencias/models/dependencia.model.js', () => ({
  Dependencia: {
    create: (...args: unknown[]): unknown => mockDependenciaCreate(...args),
  },
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

describe('organization.service', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    mockCacheGet.mockResolvedValue(null);
    mockCacheSet.mockResolvedValue(undefined);
    mockCacheDel.mockResolvedValue(undefined);
    mockAreaFindByPk.mockResolvedValue({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
    mockSubscriptionFindOne.mockResolvedValue({
      dependenciaId: DEPENDENCIA_ID,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 86400000),
    });
  });

  describe('assertCanAccessOrganization', () => {
    it('throws ForbiddenError when no active membership', async () => {
      mockMembershipFindOne.mockResolvedValueOnce(null);

      await expect(
        organizationService.assertCanAccessOrganization(USER_ID, ORG_ID)
      ).rejects.toThrow(ForbiddenError);
    });

    it('does not throw when membership exists', async () => {
      mockMembershipFindOne.mockResolvedValueOnce({
        userId: USER_ID,
        areaId: ORG_ID,
        status: 'activo',
      });

      await expect(
        organizationService.assertCanAccessOrganization(USER_ID, ORG_ID)
      ).resolves.toBeUndefined();
    });
  });

  describe('assertActiveSubscription', () => {
    it('throws ForbiddenError when no subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(organizationService.assertActiveSubscription(ORG_ID)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('throws ForbiddenError when subscription status is not active', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'canceled',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });

      await expect(organizationService.assertActiveSubscription(ORG_ID)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('throws ForbiddenError when period has ended', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() - 86400000),
      });

      await expect(organizationService.assertActiveSubscription(ORG_ID)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('does not throw when subscription is active and period not ended', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });

      await expect(organizationService.assertActiveSubscription(ORG_ID)).resolves.toBeUndefined();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('returns null when no subscription', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await organizationService.getSubscriptionStatus(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns status and currentPeriodEnd when subscription exists', async () => {
      const periodEnd = new Date(Date.now() + 86400000);
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: periodEnd,
      });

      const result = await organizationService.getSubscriptionStatus(ORG_ID);

      expect(result).toEqual({ status: 'active', currentPeriodEnd: periodEnd });
    });
  });

  describe('getCurrentPlanInfo', () => {
    it('returns null when no subscription or not active', async () => {
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      const result = await organizationService.getCurrentPlanInfo(ORG_ID);

      expect(result).toBeNull();
    });

    it('returns plan info when subscription is active with plan', async () => {
      const periodStart = new Date();
      const periodEnd = new Date(Date.now() + 86400000);
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        SubscriptionPlan: {
          id: PLAN_ID,
          name: 'básico',
          maxUsers: 10,
          maxEventos: 100,
          maxActividades: 5,
        },
      });

      const result = await organizationService.getCurrentPlanInfo(ORG_ID);

      expect(result).not.toBeNull();
      expect(result?.planId).toBe(PLAN_ID);
      expect(result?.planName).toBe('básico');
      expect(result?.status).toBe('active');
      expect(result?.limits.maxUsers).toBe(10);
    });
  });

  describe('createOrganization', () => {
    it('creates organization without access check', async () => {
      const createdOrg = {
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Test Org',
        ecosystem_type: 'terrestre',
        settings: {},
      };
      mockDependenciaCreate.mockResolvedValueOnce({ id: DEPENDENCIA_ID });
      mockAreaCreate.mockResolvedValueOnce(createdOrg);

      const result = await organizationService.createOrganization({
        name: 'Test Org',
        ecosystem_type: 'terrestre',
        admin_email: 'admin@test.com',
        settings: {},
      });

      expect(mockDependenciaCreate).toHaveBeenCalled();
      expect(mockAreaCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          dependenciaId: DEPENDENCIA_ID,
          name: 'Test Org',
          ecosystem_type: 'terrestre',
          settings: {},
        })
      );
      expect(result).toEqual(createdOrg);
    });
  });

  describe('getOrganizationById', () => {
    it('throws when assertCanAccessOrganization rejects', async () => {
      mockMembershipFindOne.mockResolvedValueOnce(null);

      await expect(organizationService.getOrganizationById(ORG_ID, USER_ID)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('throws when assertActiveSubscription rejects', async () => {
      mockMembershipFindOne.mockResolvedValueOnce({ userId: USER_ID, areaId: ORG_ID });
      mockSubscriptionFindOne.mockResolvedValueOnce(null);

      await expect(organizationService.getOrganizationById(ORG_ID, USER_ID)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('throws NotFoundError when organization does not exist', async () => {
      mockMembershipFindOne.mockResolvedValueOnce({ userId: USER_ID, areaId: ORG_ID });
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      mockAreaFindByPk.mockResolvedValueOnce({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
      mockAreaFindByPk.mockResolvedValueOnce(null);

      await expect(organizationService.getOrganizationById(ORG_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('returns organization when found', async () => {
      const orgRecord = {
        id: ORG_ID,
        dependenciaId: DEPENDENCIA_ID,
        name: 'Test Org',
        ecosystem_type: 'terrestre',
        settings: {},
      };
      mockMembershipFindOne.mockResolvedValueOnce({ userId: USER_ID, areaId: ORG_ID });
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      mockAreaFindByPk.mockResolvedValueOnce({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
      mockAreaFindByPk.mockResolvedValueOnce(orgRecord);

      const result = await organizationService.getOrganizationById(ORG_ID, USER_ID);

      expect(result).toEqual(orgRecord);
    });
  });

  describe('listOrganizations', () => {
    it('returns empty list when user has no memberships', async () => {
      mockMembershipFindAll.mockResolvedValueOnce([]);

      const result = await organizationService.listOrganizations(
        { page: 1, limit: 10, sortOrder: 'desc', name: undefined },
        USER_ID
      );

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(mockAreaFindAndCountAll).not.toHaveBeenCalled();
    });

    it('returns only organizations where user has membership', async () => {
      mockMembershipFindAll.mockResolvedValueOnce([{ areaId: ORG_ID }]);
      mockAreaFindAndCountAll.mockResolvedValueOnce({
        rows: [
          {
            id: ORG_ID,
            name: 'Test Org',
            ecosystem_type: 'terrestre',
            settings: {},
          },
        ],
        count: 1,
      });

      const result = await organizationService.listOrganizations(
        { page: 1, limit: 10, sortOrder: 'desc', name: undefined },
        USER_ID
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.id).toBe(ORG_ID);
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('updateOrganization', () => {
    it('updates only provided fields', async () => {
      const orgRecord = {
        id: ORG_ID,
        name: 'Old Name',
        ecosystem_type: 'terrestre',
        settings: {},
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockMembershipFindOne.mockResolvedValueOnce({ userId: USER_ID, areaId: ORG_ID });
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      mockAreaFindByPk.mockResolvedValueOnce({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
      mockAreaFindByPk.mockResolvedValueOnce(orgRecord);

      await organizationService.updateOrganization(ORG_ID, { name: 'New Name' }, USER_ID);

      expect(orgRecord.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
    });
  });

  describe('deleteOrganization', () => {
    it('calls org.destroy for soft delete', async () => {
      const orgRecord = {
        id: ORG_ID,
        destroy: vi.fn().mockResolvedValue(undefined),
      };
      mockMembershipFindOne.mockResolvedValueOnce({ userId: USER_ID, areaId: ORG_ID });
      mockSubscriptionFindOne.mockResolvedValueOnce({
        dependenciaId: DEPENDENCIA_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      mockAreaFindByPk.mockResolvedValueOnce({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
      mockAreaFindByPk.mockResolvedValueOnce(orgRecord);

      await organizationService.deleteOrganization(ORG_ID, USER_ID);

      expect(orgRecord.destroy).toHaveBeenCalled();
    });
  });
});
