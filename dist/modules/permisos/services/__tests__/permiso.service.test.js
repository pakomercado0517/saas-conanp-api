import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { ValidationError, NotFoundError } from '../../../../shared/errors/index.js';
import { sequelize } from '../../../../shared/database/index.js';
import { findMatchingActividadesByDependencia } from '../permiso-scope.helper.js';
import * as permisoService from '../permiso.service.js';
const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const AREA2_ID = 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0';
const ACTIVIDAD2_ID = '11111111-2222-3333-4444-555555555555';
const DEPENDENCIA_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PRESTADOR_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const ACTIVIDAD_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const PERMISO_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const mockAssertCanAccessOrganization = vi.fn();
const mockAreaFindByPk = vi.fn();
const mockPermisoFindOne = vi.fn();
const mockPermisoCreate = vi.fn();
const mockPermisoFindAndCountAll = vi.fn();
const mockPrestadorFindOne = vi.fn();
const mockActividadFindOne = vi.fn();
vi.mock('@/modules/organizations/services/organization.service.js', () => ({
    assertCanAccessOrganization: (...args) => mockAssertCanAccessOrganization(...args),
}));
vi.mock('@/modules/areas/models/area.model.js', () => ({
    Area: {
        findByPk: (...args) => mockAreaFindByPk(...args),
    },
}));
vi.mock('@/modules/permisos/models/permiso.model.js', () => ({
    Permiso: {
        findOne: (...args) => mockPermisoFindOne(...args),
        create: (...args) => mockPermisoCreate(...args),
        findAndCountAll: (...args) => mockPermisoFindAndCountAll(...args),
    },
}));
vi.mock('@/modules/prestadores/models/prestador-profile.model.js', () => ({
    PrestadorProfile: {
        findOne: (...args) => mockPrestadorFindOne(...args),
    },
}));
vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
    Actividad: {
        findOne: (...args) => mockActividadFindOne(...args),
    },
}));
vi.mock('@/modules/users/models/user.model.js', () => ({
    User: {},
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
vi.mock('../permiso-scope.helper.js', () => ({
    findMatchingActividadesByDependencia: vi.fn(),
}));
const mockFindMatching = vi.mocked(findMatchingActividadesByDependencia);
const mockTransaction = vi.mocked(sequelize.transaction);
describe('permiso.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertCanAccessOrganization.mockResolvedValue(undefined);
        mockAreaFindByPk.mockResolvedValue({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
        mockFindMatching.mockReset();
    });
    describe('validateFechasVigencia', () => {
        it('throws ValidationError when validTo <= validFrom', () => {
            const validFrom = DateTime.fromISO('2025-02-01');
            const validTo = DateTime.fromISO('2025-01-31');
            expect(() => permisoService.validateFechasVigencia(validFrom, validTo)).toThrow(ValidationError);
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
                status: 'inactivo',
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
            };
            const date = DateTime.fromISO('2025-02-15');
            expect(permisoService.isPermisoVigente(permiso, date)).toBe(false);
        });
        it('returns false when date is outside validity range', () => {
            const permiso = {
                status: 'activo',
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
            };
            const date = DateTime.fromISO('2025-03-01');
            expect(permisoService.isPermisoVigente(permiso, date)).toBe(false);
        });
        it('returns true when status is activo and date is within range', () => {
            const permiso = {
                status: 'activo',
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
            };
            const date = DateTime.fromISO('2025-02-15');
            expect(permisoService.isPermisoVigente(permiso, date)).toBe(true);
        });
    });
    describe('validatePrestadorHasPermisoVigente', () => {
        it('throws ValidationError when prestador does not exist', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID)).rejects.toThrow(ValidationError);
            expect(mockAreaFindByPk).toHaveBeenCalledWith(ORG_ID);
            expect(mockPrestadorFindOne).toHaveBeenCalledWith({
                where: { id: PRESTADOR_ID, dependenciaId: DEPENDENCIA_ID },
            });
        });
        it('throws ValidationError when actividad does not exist', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID)).rejects.toThrow(ValidationError);
            expect(mockActividadFindOne).toHaveBeenCalledWith({
                where: { id: ACTIVIDAD_ID, areaId: ORG_ID },
            });
        });
        it('returns null when no vigent permiso found', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, areaId: ORG_ID });
            mockPermisoFindOne.mockResolvedValueOnce(null);
            const result = await permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID);
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
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, areaId: ORG_ID });
            mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);
            const result = await permisoService.validatePrestadorHasPermisoVigente(PRESTADOR_ID, ACTIVIDAD_ID, ORG_ID, DateTime.fromISO('2025-02-15'));
            expect(result).toEqual(permisoRecord);
        });
    });
    describe('createPermiso', () => {
        const createData = {
            prestadorId: PRESTADOR_ID,
            actividadId: ACTIVIDAD_ID,
            validFrom: DateTime.fromISO('2025-02-01'),
            validTo: DateTime.fromISO('2025-02-28'),
            status: 'activo',
            appliesToAllAreas: false,
        };
        it('throws when assertCanAccessOrganization rejects', async () => {
            const { ForbiddenError } = await import('../../../../shared/errors/index.js');
            mockAssertCanAccessOrganization.mockRejectedValueOnce(new ForbiddenError('No tienes acceso'));
            await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow();
        });
        it('throws NotFoundError when prestador not found', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws NotFoundError when actividad not found', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError on unique constraint (duplicate permiso)', async () => {
            const prestador = { id: PRESTADOR_ID, dependenciaId: DEPENDENCIA_ID };
            const actividad = { id: ACTIVIDAD_ID, areaId: ORG_ID };
            mockPrestadorFindOne.mockResolvedValueOnce(prestador);
            mockActividadFindOne.mockResolvedValueOnce(actividad);
            const uniqueError = new Error('Unique constraint');
            uniqueError.name = 'SequelizeUniqueConstraintError';
            mockPermisoCreate.mockRejectedValueOnce(uniqueError);
            await expect(permisoService.createPermiso(createData, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('creates permiso and returns it with relations on success', async () => {
            const prestador = { id: PRESTADOR_ID, dependenciaId: DEPENDENCIA_ID };
            const actividad = { id: ACTIVIDAD_ID, areaId: ORG_ID };
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
            createdPermiso.reload.mockResolvedValue(reloadedPermiso);
            const result = await permisoService.createPermiso(createData, ORG_ID, USER_ID);
            expect(mockPermisoCreate).toHaveBeenCalledWith(expect.objectContaining({
                prestadorId: PRESTADOR_ID,
                actividadId: ACTIVIDAD_ID,
                status: 'activo',
                appliesToAllAreas: false,
                permissionGroupId: null,
            }));
            expect(result).toBeDefined();
        });
        it('creates one permiso per area when appliesToAllAreas is true', async () => {
            const createDataAll = {
                ...createData,
                appliesToAllAreas: true,
            };
            const prestador = { id: PRESTADOR_ID, dependenciaId: DEPENDENCIA_ID };
            const actividad = { id: ACTIVIDAD_ID, areaId: ORG_ID };
            mockPrestadorFindOne.mockResolvedValueOnce(prestador);
            mockActividadFindOne.mockResolvedValueOnce(actividad);
            mockFindMatching.mockResolvedValueOnce([
                { areaId: ORG_ID, areaName: 'Área 1', actividadId: ACTIVIDAD_ID },
                { areaId: AREA2_ID, areaName: 'Área 2', actividadId: ACTIVIDAD2_ID },
            ]);
            mockPermisoFindOne.mockResolvedValue(null);
            const created1 = {
                id: PERMISO_ID,
                prestadorId: PRESTADOR_ID,
                actividadId: ACTIVIDAD_ID,
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
                status: 'activo',
                appliesToAllAreas: true,
                permissionGroupId: '88888888-8888-8888-8888-888888888888',
                reload: vi.fn(),
            };
            const created2 = {
                id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                prestadorId: PRESTADOR_ID,
                actividadId: ACTIVIDAD2_ID,
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
                status: 'activo',
                appliesToAllAreas: true,
                permissionGroupId: '88888888-8888-8888-8888-888888888888',
                reload: vi.fn(),
            };
            const reloaded1 = { ...created1, PrestadorProfile: prestador, Actividad: actividad };
            const reloaded2 = {
                ...created2,
                PrestadorProfile: prestador,
                Actividad: { id: ACTIVIDAD2_ID, areaId: AREA2_ID },
            };
            created1.reload.mockResolvedValue(reloaded1);
            created2.reload.mockResolvedValue(reloaded2);
            mockPermisoCreate.mockResolvedValueOnce(created1).mockResolvedValueOnce(created2);
            const result = await permisoService.createPermiso(createDataAll, ORG_ID, USER_ID);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(mockTransaction).toHaveBeenCalled();
            expect(mockPermisoCreate).toHaveBeenCalledTimes(2);
            expect(mockPermisoCreate).toHaveBeenNthCalledWith(1, expect.objectContaining({
                actividadId: ACTIVIDAD_ID,
                appliesToAllAreas: true,
                permissionGroupId: expect.any(String),
            }), expect.anything());
        });
        it('throws ValidationError when multi-area matching fails (e.g. missing activity)', async () => {
            const createDataAll = {
                ...createData,
                appliesToAllAreas: true,
            };
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, areaId: ORG_ID });
            mockFindMatching.mockRejectedValueOnce(new ValidationError('Falta actividad en un área', undefined, {
                missingAreas: [{ areaId: AREA2_ID, areaName: 'Sur' }],
            }));
            await expect(permisoService.createPermiso(createDataAll, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
            expect(mockPermisoCreate).not.toHaveBeenCalled();
        });
        it('throws ValidationError when duplicate exists for any matched actividad (multi-area)', async () => {
            const createDataAll = {
                ...createData,
                appliesToAllAreas: true,
            };
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockActividadFindOne.mockResolvedValueOnce({ id: ACTIVIDAD_ID, areaId: ORG_ID });
            mockFindMatching.mockResolvedValueOnce([
                { areaId: ORG_ID, areaName: 'Área 1', actividadId: ACTIVIDAD_ID },
                { areaId: AREA2_ID, areaName: 'Área 2', actividadId: ACTIVIDAD2_ID },
            ]);
            mockPermisoFindOne.mockResolvedValueOnce({ id: 'existing-permiso' });
            await expect(permisoService.createPermiso(createDataAll, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
            expect(mockTransaction).not.toHaveBeenCalled();
        });
    });
    describe('getPermisoById', () => {
        it('throws NotFoundError when permiso not found', async () => {
            mockPermisoFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws NotFoundError when actividad does not belong to organization', async () => {
            const permisoRecord = {
                id: PERMISO_ID,
                Actividad: { areaId: 'other-org-id' },
            };
            mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);
            await expect(permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('returns permiso when found and belongs to organization', async () => {
            const permisoRecord = {
                id: PERMISO_ID,
                prestadorId: PRESTADOR_ID,
                actividadId: ACTIVIDAD_ID,
                Actividad: { areaId: ORG_ID },
            };
            mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);
            const result = await permisoService.getPermisoById(PERMISO_ID, ORG_ID, USER_ID);
            expect(result).toEqual(permisoRecord);
        });
    });
    describe('listPermisosByPrestador', () => {
        it('throws NotFoundError when prestador not found', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce(null);
            await expect(permisoService.listPermisosByPrestador(PRESTADOR_ID, ORG_ID, {
                page: 1,
                limit: 10,
                sortOrder: 'desc',
                prestadorId: undefined,
                actividadId: undefined,
                documentUrl: undefined,
            }, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('returns paginated data when prestador exists', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                dependenciaId: DEPENDENCIA_ID,
            });
            mockPermisoFindAndCountAll.mockResolvedValueOnce({
                rows: [{ id: PERMISO_ID, prestadorId: PRESTADOR_ID }],
                count: 1,
            });
            const result = await permisoService.listPermisosByPrestador(PRESTADOR_ID, ORG_ID, {
                page: 1,
                limit: 10,
                sortOrder: 'desc',
                prestadorId: undefined,
                actividadId: undefined,
                documentUrl: undefined,
            }, USER_ID);
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
            await expect(permisoService.updatePermiso(PERMISO_ID, ORG_ID, { status: 'inactivo' }, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('updates permiso and returns it on success', async () => {
            const permisoRecord = {
                id: PERMISO_ID,
                prestadorId: PRESTADOR_ID,
                actividadId: ACTIVIDAD_ID,
                validFrom: new Date('2025-02-01'),
                validTo: new Date('2025-02-28'),
                status: 'activo',
                Actividad: { areaId: ORG_ID },
                update: vi.fn().mockResolvedValue(undefined),
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockPermisoFindOne.mockResolvedValueOnce(permisoRecord);
            const updatedPermiso = { ...permisoRecord, status: 'inactivo' };
            permisoRecord.reload.mockResolvedValue(updatedPermiso);
            const result = await permisoService.updatePermiso(PERMISO_ID, ORG_ID, { status: 'inactivo' }, USER_ID);
            expect(permisoRecord.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'inactivo' }));
            expect(result).toBeDefined();
        });
    });
});
//# sourceMappingURL=permiso.service.test.js.map