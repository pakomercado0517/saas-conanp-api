import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';
import type { UUID } from '@/shared/database/types.js';
import * as permisoService from '../permiso.service.js';

const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID;
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID;
const PRESTADOR_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID;
const ACTIVIDAD_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd' as UUID;
const PERMISO_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' as UUID;

const mockAssertCanAccessOrganization = vi.fn();
const mockPermisoFindOne = vi.fn();
const mockPermisoCreate = vi.fn();
const mockPermisoFindAndCountAll = vi.fn();
const mockPrestadorFindOne = vi.fn();
const mockActividadFindOne = vi.fn();

vi.mock('@/modules/organizations/services/organization.service.js', () => ({
  assertCanAccessOrganization: (...args: unknown[]): unknown =>
    mockAssertCanAccessOrganization(...args),
}));

vi.mock('@/modules/permisos/models/permiso.model.js', () => ({
  Permiso: {
    findOne: (...args: unknown[]): unknown => mockPermisoFindOne(...args),
    create: (...args: unknown[]): unknown => mockPermisoCreate(...args),
    findAndCountAll: (...args: unknown[]): unknown => mockPermisoFindAndCountAll(...args),
  },
}));

vi.mock('@/modules/prestadores/models/prestador-profile.model.js', () => ({
  PrestadorProfile: {
    findOne: (...args: unknown[]): unknown => mockPrestadorFindOne(...args),
  },
}));

vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
  Actividad: {
    findOne: (...args: unknown[]): unknown => mockActividadFindOne(...args),
  },
}));

vi.mock('@/modules/users/models/user.model.js', () => ({
  User: {},
}));

vi.mock('@/shared/logger/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));

describe('permiso.service', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    mockAssertCanAccessOrganization.mockResolvedValue(undefined);
  });

  describe('validateFechasVigencia', () => {
    it('throws ValidationError when validTo <= validFrom', () => {
      const validFrom = DateTime.fromISO('2025-02-01');
      const validTo = DateTime.fromISO('2025-01-31');

      expect(() => permisoService.validateFechasVigencia(validFrom, validTo)).toThrow(
        ValidationError
      );
    });

    it('does not throw when validTo is after validFrom', () => {
      const validFrom = DateTime.fromISO('2025-02-01');
      const validTo = DateTime.fromISO('2025-02-28');

      expect(() => permisoService.validateFechasVigencia(validFrom, validTo)).not.toThrow();
    });
  });

  describe('isPermisoVigente', () => {
    it('returns false when status is not activo', () => {
      const permiso = {
        status: 'inactivo' as const,
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
      };
      const date = DateTime.fromISO('2025-02-15');

      expect(permisoService.isPermisoVigente(permiso as never, date)).toBe(false);
    });

    it('returns false when date is outside validity range', () => {
      const permiso = {
        status: 'activo' as const,
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
      };
      const date = DateTime.fromISO('2025-03-01');

      expect(permisoService.isPermisoVigente(permiso as never, date)).toBe(false);
    });

    it('returns true when status is activo and date is within range', () => {
      const permiso = {
        status: 'activo' as const,
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
      };
      const date = DateTime.fromISO('2025-02-15');

      expect(permisoService.isPermisoVigente(permiso as never, date)).toBe(true);
    });
  });

  describe('validatePrestadorHasPermisoVigente', () => {
    it('throws ValidationError when prestador does not exist', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce(null);

      await expect(
        permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID)
      ).rejects.toThrow(ValidationError);

      expect(mockPrestadorFindOne).toHaveBeenCalledWith({
        where: { id: PRESTADOR_ID, organizationId: ORG_ID },
      });
    });

    it('throws ValidationError when actividad does not exist', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce({ id: PRESTADOR_ID, organizationId: ORG_ID });
      mockActividadFindOne.mockResolvedValueOnce(null);

      await expect(
        permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID)
      ).rejects.toThrow(ValidationError);
    });

    it('returns null when no vigent permiso found', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce({ id: PRESTADOR_ID, organizationId: ORG_ID });
      mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, organizationId: ORG_ID });
      mockPermisoFindOne.mockResolvedValueOnce(null);

      const result = await permisoService.validatePrestadorHasPermisoVigente(
        PRESTADOR_ID,
        ACTIVIDAD_ID,
        ORG_ID
      );

      expect(result).toBeNull();
    });

    it('returns permiso when vigent permiso found', async () => {
      const permisoRecord = {
        id: PERMISO_ID,
        prestadorId: PRESTADOR_ID,
        actividadId: ACTIVIDAD_ID,
        status: 'activo',
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
      };
      mockPrestadorFindOne.mockResolvedValueOnce({ id: PRESTADOR_ID, organizationId: ORG_ID });
      mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, organizationId: ORG_ID });
      mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);

      const result = await permisoService.validatePrestadorHasPermisoVigente(
        PRESTADOR_ID,
        ACTIVIDAD_ID,
        ORG_ID,
        DateTime.fromISO('2025-02-15')
      );

      expect(result).toEqual(permisoRecord);
    });
  });

  describe('createPermiso', () => {
    const createData = {
      prestadorId: PRESTADOR_ID,
      actividadId: ACTIVIDAD_ID,
      validFrom: DateTime.fromISO('2025-02-01'),
      validTo: DateTime.fromISO('2025-02-28'),
      status: 'activo' as const,
    };

    it('throws when assertCanAccessOrganization rejects', async () => {
      const { ForbiddenError } = await import('@/shared/errors/index.js');
      mockAssertCanAccessOrganization.mockRejectedValueOnce(new ForbiddenError('No tienes acceso'));

      await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow();
    });

    it('throws NotFoundError when prestador not found', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce(null);

      await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('throws NotFoundError when actividad not found', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce({
        id: PRESTADOR_ID,
        organizationId: ORG_ID,
      });
      mockActividadFindOne.mockResolvedValueOnce(null);

      await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('throws ValidationError on unique constraint (duplicate permiso)', async () => {
      const prestador = { id: PRESTADOR_ID, organizationId: ORG_ID };
      const actividad = { id: ACTIVIDAD_ID, organizationId: ORG_ID };
      mockPrestadorFindOne.mockResolvedValueOnce(prestador);
      mockActividadFindOne.mockResolvedValueOnce(actividad);
      const uniqueError = new Error('Unique constraint');
      (uniqueError as Error & { name: string }).name = 'SequelizeUniqueConstraintError';
      mockPermisoCreate.mockRejectedValueOnce(uniqueError);

      await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(
        ValidationError
      );
    });

    it('creates permiso and returns it with relations on success', async () => {
      const prestador = { id: PRESTADOR_ID, organizationId: ORG_ID };
      const actividad = { id: ACTIVIDAD_ID, organizationId: ORG_ID };
      mockPrestadorFindOne.mockResolvedValueOnce(prestador);
      mockActividadFindOne.mockResolvedValueOnce(actividad);
      const createdPermiso = {
        id: PERMISO_ID,
        prestadorId: PRESTADOR_ID,
        actividadId: ACTIVIDAD_ID,
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
        status: 'activo',
        documentUrl: null,
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockPermisoCreate.mockResolvedValueOnce(createdPermiso);
      const reloadedPermiso = {
        ...createdPermiso,
        PrestadorProfile: prestador,
        Actividad: actividad,
      };
      (createdPermiso.reload as ReturnType<typeof vi.fn>).mockResolvedValue(reloadedPermiso);

      const result = await permisoService.createPermiso(createData, ORG_ID, USER_ID);

      expect(mockPermisoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          prestadorId: PRESTADOR_ID,
          actividadId: ACTIVIDAD_ID,
          status: 'activo',
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('getPermisoById', () => {
    it('throws NotFoundError when permiso not found', async () => {
      mockPermisoFindOne.mockResolvedValueOnce(null);

      await expect(permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('throws NotFoundError when actividad does not belong to organization', async () => {
      const permisoRecord = {
        id: PERMISO_ID,
        Actividad: { organizationId: 'other-org-id' },
      };
      mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);

      await expect(permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID)).rejects.toThrow(
        NotFoundError
      );
    });

    it('returns permiso when found and belongs to organization', async () => {
      const permisoRecord = {
        id: PERMISO_ID,
        prestadorId: PRESTADOR_ID,
        actividadId: ACTIVIDAD_ID,
        Actividad: { organizationId: ORG_ID },
      };
      mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);

      const result = await permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID);

      expect(result).toEqual(permisoRecord);
    });
  });

  describe('listPermisosByPrestador', () => {
    it('throws NotFoundError when prestador not found', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce(null);

      await expect(
        permisoService.listPermisosByPrestador(
          PRESTADOR_ID,
          ORG_ID,
          {
            page: 1,
            limit: 10,
            sortOrder: 'desc',
            prestadorId: undefined,
            actividadId: undefined,
            documentUrl: undefined,
          },
          USER_ID
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('returns paginated data when prestador exists', async () => {
      mockPrestadorFindOne.mockResolvedValueOnce({ id: PRESTADOR_ID, organizationId: ORG_ID });
      mockPermisoFindAndCountAll.mockResolvedValueOnce({
        rows: [{ id: PERMISO_ID, prestadorId: PRESTADOR_ID }],
        count: 1,
      });

      const result = await permisoService.listPermisosByPrestador(
        PRESTADOR_ID,
        ORG_ID,
        {
          page: 1,
          limit: 10,
          sortOrder: 'desc',
          prestadorId: undefined,
          actividadId: undefined,
          documentUrl: undefined,
        },
        USER_ID
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('updatePermiso', () => {
    it('throws NotFoundError when permiso not found', async () => {
      mockPermisoFindOne.mockResolvedValueOnce(null);

      await expect(
        permisoService.updatePermiso(PERMISO_ID, ORG_ID, { status: 'inactivo' }, USER_ID)
      ).rejects.toThrow(NotFoundError);
    });

    it('updates permiso and returns it on success', async () => {
      const permisoRecord = {
        id: PERMISO_ID,
        prestadorId: PRESTADOR_ID,
        actividadId: ACTIVIDAD_ID,
        validFrom: new Date('2025-02-01'),
        validTo: new Date('2025-02-28'),
        status: 'activo',
        Actividad: { organizationId: ORG_ID },
        update: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
      };
      mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);
      const updatedPermiso = { ...permisoRecord, status: 'inactivo' };
      (permisoRecord.reload as ReturnType<typeof vi.fn>).mockResolvedValue(updatedPermiso);

      const result = await permisoService.updatePermiso(
        PERMISO_ID,
        ORG_ID,
        { status: 'inactivo' },
        USER_ID
      );

      expect(permisoRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inactivo' })
      );
      expect(result).toBeDefined();
    });
  });
});
