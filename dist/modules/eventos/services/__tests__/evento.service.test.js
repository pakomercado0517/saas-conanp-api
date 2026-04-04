import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/errors/index.js';
import * as eventoService from '../evento.service.js';
const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ACTIVIDAD_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const BLOQUE_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const PRESTADOR_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const EVENTO_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const DEPENDENCIA_ID = '11111111-1111-1111-1111-111111111111';
const auditDefaults = { capacityOverride: false };
const mockAssertCanAccessOrganization = vi.fn();
const mockAreaFindByPk = vi.fn();
const mockValidatePrestadorHasPermisoVigente = vi.fn();
const mockVerificarDisponibilidadPorBloque = vi.fn();
const mockVerificarDisponibilidadPorDia = vi.fn();
const mockCheckEventosLimit = vi.fn();
const mockActividadFindOne = vi.fn();
const mockBloqueFindOne = vi.fn();
const mockPrestadorFindOne = vi.fn();
const mockEventoOperativoFindOne = vi.fn();
const mockEventoOperativoCreate = vi.fn();
const mockEventoOperativoFindAndCountAll = vi.fn();
const mockMembershipFindOne = vi.fn();
vi.mock('@/modules/organizations/services/organization.service.js', () => ({
    assertCanAccessOrganization: (...args) => mockAssertCanAccessOrganization(...args),
}));
vi.mock('@/modules/areas/models/area.model.js', () => ({
    Area: {
        findByPk: (...args) => mockAreaFindByPk(...args),
    },
}));
vi.mock('@/modules/permisos/services/permiso.service.js', () => ({
    validatePrestadorHasPermisoVigente: (...args) => mockValidatePrestadorHasPermisoVigente(...args),
}));
vi.mock('@/modules/actividades/services/capacidad.service.js', () => ({
    verificarDisponibilidadPorBloque: (...args) => mockVerificarDisponibilidadPorBloque(...args),
    verificarDisponibilidadPorDia: (...args) => mockVerificarDisponibilidadPorDia(...args),
}));
vi.mock('@/modules/subscriptions/services/subscription-limits.service.js', () => ({
    checkEventosLimit: (...args) => mockCheckEventosLimit(...args),
}));
vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
    Actividad: {
        findOne: (...args) => mockActividadFindOne(...args),
        findByPk: vi.fn(),
    },
}));
vi.mock('@/modules/actividades/models/bloque.model.js', () => ({
    Bloque: {
        findOne: (...args) => mockBloqueFindOne(...args),
    },
}));
vi.mock('@/modules/prestadores/models/prestador-profile.model.js', () => ({
    PrestadorProfile: {
        findOne: (...args) => mockPrestadorFindOne(...args),
    },
}));
vi.mock('@/modules/users/models/user.model.js', () => ({
    User: {},
}));
vi.mock('@/modules/eventos/models/evento-operativo.model.js', () => ({
    EventoOperativo: {
        findOne: (...args) => mockEventoOperativoFindOne(...args),
        findAndCountAll: (...args) => mockEventoOperativoFindAndCountAll(...args),
        create: (...args) => mockEventoOperativoCreate(...args),
    },
}));
vi.mock('@/modules/users/models/membership.model.js', () => ({
    Membership: {
        findOne: (...args) => mockMembershipFindOne(...args),
    },
}));
vi.mock('@/modules/payments/models/payment.model.js', () => ({
    Payment: {
        findOne: vi.fn().mockResolvedValue(null),
    },
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
vi.mock('@/shared/database/index.js', () => ({
    sequelize: {
        transaction: vi.fn(() => Promise.resolve({
            commit: vi.fn().mockResolvedValue(undefined),
            rollback: vi.fn().mockResolvedValue(undefined),
        })),
    },
}));
vi.mock('@/modules/users/services/membership.service.js', () => ({
    isUserAdminInArea: vi.fn().mockResolvedValue(false),
}));
vi.mock('@/modules/eventos/services/evento-capacity-lock.js', () => ({
    acquireEventoCapacityAdvisoryLock: vi.fn().mockResolvedValue(undefined),
}));
describe('evento.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertCanAccessOrganization.mockResolvedValue(undefined);
        mockCheckEventosLimit.mockResolvedValue(undefined);
        mockValidatePrestadorHasPermisoVigente.mockResolvedValue({ id: 'permiso-id' });
        mockAreaFindByPk.mockResolvedValue({ id: ORG_ID, dependenciaId: DEPENDENCIA_ID });
        mockVerificarDisponibilidadPorBloque.mockResolvedValue({
            disponible: true,
            capacidadTotal: 10,
            capacidadUsada: 0,
            capacidadDisponible: 10,
            limite: 10,
        });
        mockVerificarDisponibilidadPorDia.mockResolvedValue({
            disponible: true,
            capacidadTotal: 10,
            capacidadUsada: 0,
            capacidadDisponible: 10,
            limite: 10,
        });
    });
    describe('createEvento', () => {
        it('throws ForbiddenError when assertCanAccessOrganization rejects', async () => {
            mockAssertCanAccessOrganization.mockRejectedValueOnce(new ForbiddenError('No tienes acceso'));
            await expect(eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID)).rejects.toThrow(ForbiddenError);
        });
        it('throws NotFoundError when actividad does not exist', async () => {
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError when agenda type does not match actividad', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            await expect(eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('throws ValidationError when prestador has no vigent permiso', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce({
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                organizationId: ORG_ID,
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                organizationId: ORG_ID,
            });
            mockValidatePrestadorHasPermisoVigente.mockResolvedValueOnce(null);
            await expect(eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('throws ValidationError when no capacity available', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce({
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                organizationId: ORG_ID,
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                organizationId: ORG_ID,
            });
            mockVerificarDisponibilidadPorBloque.mockResolvedValueOnce({
                disponible: false,
                capacidadDisponible: 0,
                capacidadUsada: 10,
                capacidadTotal: 10,
                limite: 10,
            });
            await expect(eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
        });
        it('creates evento with BLOQUES agenda on success', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce({
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                organizationId: ORG_ID,
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                organizationId: ORG_ID,
            });
            const createdEvento = {
                id: EVENTO_ID,
                organizationId: ORG_ID,
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                bloqueId: BLOQUE_ID,
                date: '2025-02-01',
                peopleCount: 1,
                status: 'programado',
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockEventoOperativoCreate.mockResolvedValueOnce(createdEvento);
            createdEvento.reload.mockResolvedValue(createdEvento);
            const result = await eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'BLOQUES',
                bloqueId: BLOQUE_ID,
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID);
            expect(mockEventoOperativoCreate).toHaveBeenCalledWith(expect.objectContaining({
                areaId: ORG_ID,
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                bloqueId: BLOQUE_ID,
                date: '2025-02-01',
                peopleCount: 1,
                status: 'programado',
                createdByUserId: USER_ID,
                capacityOverride: false,
                capacityOverrideReason: null,
            }), expect.any(Object));
            expect(result).toBeDefined();
        });
        it('creates evento with HORARIO_LIBRE agenda on success', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                organizationId: ORG_ID,
            });
            const createdEvento = {
                id: EVENTO_ID,
                organizationId: ORG_ID,
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: '2025-02-01',
                startTime: '09:00',
                endTime: '10:00',
                peopleCount: 1,
                status: 'programado',
                reload: vi.fn().mockResolvedValue(undefined),
            };
            mockEventoOperativoCreate.mockResolvedValueOnce(createdEvento);
            createdEvento.reload.mockResolvedValue(createdEvento);
            const result = await eventoService.createEvento({
                actividadId: ACTIVIDAD_ID,
                prestadorId: PRESTADOR_ID,
                date: DateTime.fromISO('2025-02-01'),
                agendaType: 'HORARIO_LIBRE',
                startTime: DateTime.fromISO('2025-02-01T09:00:00'),
                endTime: DateTime.fromISO('2025-02-01T10:00:00'),
                peopleCount: 1,
                paymentRequired: false,
                ...auditDefaults,
            }, ORG_ID, USER_ID);
            expect(mockVerificarDisponibilidadPorDia).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
    describe('getEventoById', () => {
        it('throws NotFoundError when evento does not exist', async () => {
            mockEventoOperativoFindOne.mockResolvedValueOnce(null);
            await expect(eventoService.getEventoById(EVENTO_ID, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ForbiddenError when prestador tries to view another prestador evento', async () => {
            const eventoRecord = {
                id: EVENTO_ID,
                organizationId: ORG_ID,
                prestadorId: PRESTADOR_ID,
                deletedAt: null,
                Actividad: {},
                PrestadorProfile: {},
                Bloque: null,
            };
            mockEventoOperativoFindOne.mockResolvedValueOnce(eventoRecord);
            mockMembershipFindOne.mockResolvedValueOnce({
                userId: USER_ID,
                areaId: ORG_ID,
                role: 'prestador',
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: 'other-prestador-id',
                userId: USER_ID,
                organizationId: ORG_ID,
            });
            await expect(eventoService.getEventoById(EVENTO_ID, ORG_ID, USER_ID)).rejects.toThrow(ForbiddenError);
        });
        it('returns evento when admin or owner', async () => {
            const eventoRecord = {
                id: EVENTO_ID,
                organizationId: ORG_ID,
                prestadorId: PRESTADOR_ID,
                deletedAt: null,
                Actividad: {},
                PrestadorProfile: {},
                Bloque: null,
            };
            mockEventoOperativoFindOne.mockResolvedValueOnce(eventoRecord);
            mockMembershipFindOne.mockResolvedValueOnce({
                userId: USER_ID,
                areaId: ORG_ID,
                role: 'admin',
            });
            const result = await eventoService.getEventoById(EVENTO_ID, ORG_ID, USER_ID);
            expect(result).toEqual(eventoRecord);
        });
    });
    describe('listEventos', () => {
        it('filters by prestadorId when user is prestador', async () => {
            mockMembershipFindOne.mockResolvedValueOnce({
                userId: USER_ID,
                areaId: ORG_ID,
                role: 'prestador',
            });
            mockPrestadorFindOne.mockResolvedValueOnce({
                id: PRESTADOR_ID,
                userId: USER_ID,
                organizationId: ORG_ID,
            });
            mockEventoOperativoFindAndCountAll.mockResolvedValueOnce({
                rows: [
                    {
                        id: EVENTO_ID,
                        organizationId: ORG_ID,
                        prestadorId: PRESTADOR_ID,
                        Actividad: {},
                        PrestadorProfile: {},
                        Bloque: null,
                    },
                ],
                count: 1,
            });
            const result = await eventoService.listEventos(ORG_ID, {
                page: 1,
                limit: 10,
                sortOrder: 'desc',
                actividadId: undefined,
                prestadorId: undefined,
                date: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                bloqueId: undefined,
            }, USER_ID);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(mockEventoOperativoFindAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    areaId: ORG_ID,
                    prestadorId: PRESTADOR_ID,
                }),
            }));
        });
        it('returns all eventos for admin', async () => {
            mockMembershipFindOne.mockResolvedValueOnce({
                userId: USER_ID,
                areaId: ORG_ID,
                role: 'admin',
            });
            mockEventoOperativoFindAndCountAll.mockResolvedValueOnce({
                rows: [],
                count: 0,
            });
            const result = await eventoService.listEventos(ORG_ID, {
                page: 1,
                limit: 10,
                sortOrder: 'desc',
                actividadId: undefined,
                prestadorId: undefined,
                date: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                bloqueId: undefined,
            }, USER_ID);
            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(mockEventoOperativoFindAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    areaId: ORG_ID,
                }),
            }));
        });
    });
});
//# sourceMappingURL=evento.service.test.js.map