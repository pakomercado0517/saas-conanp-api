import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError, NotFoundError } from '../../../../shared/errors/index.js';
import * as activoService from '../activo.service.js';
const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PRESTADOR_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const ACTIVO_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const mockAssertCanAccessOrganization = vi.fn();
const mockActivoFindOne = vi.fn();
const mockActivoCreate = vi.fn();
const mockActivoFindAndCountAll = vi.fn();
const mockPrestadorFindOne = vi.fn();
vi.mock('@/modules/organizations/services/organization.service.js', () => ({
    assertCanAccessOrganization: (...args) => mockAssertCanAccessOrganization(...args),
}));
vi.mock('@/modules/activos/models/activo.model.js', () => ({
    Activo: {
        findOne: (...args) => mockActivoFindOne(...args),
        create: (...args) => mockActivoCreate(...args),
        findAndCountAll: (...args) => mockActivoFindAndCountAll(...args),
    },
}));
vi.mock('@/modules/prestadores/models/prestador-profile.model.js', () => ({
    PrestadorProfile: {
        findOne: (...args) => mockPrestadorFindOne(...args),
    },
}));
vi.mock('@/modules/organizations/models/organization.model.js', () => ({
    Organization: {},
}));
vi.mock('@/modules/users/models/user.model.js', () => ({
    User: {},
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
describe('activo.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertCanAccessOrganization.mockResolvedValue(undefined);
    });
    describe('validateEstadoTransition', () => {
        const validTransitions = [
            ['pendiente', 'aprobado'],
            ['pendiente', 'rechazado'],
            ['aprobado', 'suspendido'],
            ['rechazado', 'pendiente'],
            ['suspendido', 'aprobado'],
        ];
        it.each(validTransitions)('allows transition from %s to %s', (current, next) => {
            expect(() => activoService.validateEstadoTransition(current, next)).not.toThrow();
        });
        it('throws ValidationError for invalid transition pendiente -> suspendido', () => {
            expect(() => activoService.validateEstadoTransition('pendiente', 'suspendido')).toThrow(ValidationError);
        });
        it('throws ValidationError for invalid transition aprobado -> pendiente', () => {
            expect(() => activoService.validateEstadoTransition('aprobado', 'pendiente')).toThrow(ValidationError);
        });
        it('throws ValidationError for invalid transition rechazado -> aprobado', () => {
            expect(() => activoService.validateEstadoTransition('rechazado', 'aprobado')).toThrow(ValidationError);
        });
    });
    describe('validateActivoAprobado', () => {
        it('throws NotFoundError when activo does not exist', async () => {
            mockActivoFindOne.mockResolvedValueOnce(null);
            await expect(activoService.validateActivoAprobado(ACTIVO_ID, ORG_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError when activo is not aprobado', async () => {
            mockActivoFindOne.mockResolvedValueOnce({
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'pendiente',
            });
            await expect(activoService.validateActivoAprobado(ACTIVO_ID, ORG_ID)).rejects.toThrow(ValidationError);
        });
        it('returns activo when status is aprobado', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'aprobado',
                ownerId: PRESTADOR_ID,
                type: 'vehiculo',
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            const result = await activoService.validateActivoAprobado(ACTIVO_ID, ORG_ID);
            expect(result).toEqual(activoRecord);
        });
    });
    describe('createActivo', () => {
        const createData = {
            organizationId: ORG_ID,
            ownerId: PRESTADOR_ID,
            type: 'vehiculo',
            status: 'pendiente',
        };
        it('throws ValidationError when organizationId in data does not match parameter', async () => {
            const otherOrgId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
            await expect(activoService.createActivo({ ...createData, organizationId: otherOrgId }, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('throws NotFoundError when prestador does not exist', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce(null);
            await expect(activoService.createActivo(createData, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('creates activo and returns it with relations on success', async () => {
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                organizationId: ORG_ID,
            });
            const createdActivo = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                ownerId: PRESTADOR_ID,
                type: 'vehiculo',
                status: 'pendiente',
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoCreate.mockResolvedValueOnce(createdActivo);
            const reloadedActivo = {
                ...createdActivo,
                Organization: {},
                Owner: { id: PRESTADOR_ID },
            };
            createdActivo.reload.mockResolvedValue(reloadedActivo);
            const result = await activoService.createActivo(createData, ORG_ID, USER_ID);
            expect(mockActivoCreate).toHaveBeenCalledWith(expect.objectContaining({
                organizationId: ORG_ID,
                ownerId: PRESTADOR_ID,
                type: 'vehiculo',
                status: 'pendiente',
            }));
            expect(result).toBeDefined();
        });
    });
    describe('getActivoById', () => {
        it('throws NotFoundError when activo does not exist', async () => {
            mockActivoFindOne.mockResolvedValueOnce(null);
            await expect(activoService.getActivoById(ACTIVO_ID, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('returns activo when found', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                ownerId: PRESTADOR_ID,
                type: 'vehiculo',
                status: 'aprobado',
                Organization: {},
                Owner: {},
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            const result = await activoService.getActivoById(ACTIVO_ID, ORG_ID, USER_ID);
            expect(result).toEqual(activoRecord);
        });
    });
    describe('listActivos', () => {
        it('returns paginated data with filters', async () => {
            const rows = [
                {
                    id: ACTIVO_ID,
                    organizationId: ORG_ID,
                    ownerId: PRESTADOR_ID,
                    type: 'vehiculo',
                    status: 'aprobado',
                    Organization: {},
                    Owner: {},
                },
            ];
            mockActivoFindAndCountAll.mockResolvedValueOnce({ rows, count: 1 });
            const result = await activoService.listActivos(ORG_ID, { page: 1, limit: 10, sortOrder: 'desc', ownerId: undefined }, USER_ID);
            expect(result.data).toHaveLength(1);
            expect(result.pagination).toMatchObject({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            });
        });
    });
    describe('updateActivoStatus', () => {
        it('throws NotFoundError when activo does not exist', async () => {
            mockActivoFindOne.mockResolvedValueOnce(null);
            await expect(activoService.updateActivoStatus(ACTIVO_ID, ORG_ID, 'aprobado', USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError for invalid transition', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'pendiente',
                save: vi.fn().mockResolvedValue(undefined),
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            await expect(activoService.updateActivoStatus(ACTIVO_ID, ORG_ID, 'suspendido', USER_ID)).rejects.toThrow(ValidationError);
        });
        it('updates status and returns activo on valid transition', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'pendiente',
                save: vi.fn().mockResolvedValue(undefined),
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            const reloadedActivo = {
                ...activoRecord,
                status: 'aprobado',
                Organization: {},
                Owner: {},
            };
            activoRecord.reload.mockResolvedValue(reloadedActivo);
            const result = await activoService.updateActivoStatus(ACTIVO_ID, ORG_ID, 'aprobado', USER_ID);
            expect(activoRecord.status).toBe('aprobado');
            expect(activoRecord.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
    describe('updateActivo', () => {
        it('throws ValidationError for invalid status transition', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'aprobado',
                type: 'vehiculo',
                update: vi.fn().mockResolvedValue(undefined),
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            await expect(activoService.updateActivo(ACTIVO_ID, ORG_ID, { status: 'pendiente' }, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('updates activo and returns it on success', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                status: 'aprobado',
                type: 'vehiculo',
                update: vi.fn().mockResolvedValue(undefined),
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            const updatedActivo = { ...activoRecord, type: 'embarcacion', Organization: {}, Owner: {} };
            activoRecord.reload.mockResolvedValue(updatedActivo);
            const result = await activoService.updateActivo(ACTIVO_ID, ORG_ID, { type: 'embarcacion' }, USER_ID);
            expect(activoRecord.update).toHaveBeenCalledWith(expect.objectContaining({ type: 'embarcacion' }));
            expect(result).toBeDefined();
        });
    });
    describe('deleteActivo', () => {
        it('throws NotFoundError when activo does not exist', async () => {
            mockActivoFindOne.mockResolvedValueOnce(null);
            await expect(activoService.deleteActivo(ACTIVO_ID, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('performs soft delete via update', async () => {
            const activoRecord = {
                id: ACTIVO_ID,
                organizationId: ORG_ID,
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockActivoFindOne.mockResolvedValueOnce(activoRecord);
            await activoService.deleteActivo(ACTIVO_ID, ORG_ID, USER_ID);
            expect(activoRecord.update).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
        });
    });
});
//# sourceMappingURL=activo.service.test.js.map