import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { NotFoundError, ValidationError, ConflictError } from '@/shared/errors/index.js';
import * as capacidadService from '../capacidad.service.js';
const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ACTIVIDAD_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const BLOQUE_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const CAPACIDAD_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const mockAssertIsAdmin = vi.fn();
const mockAssertCanAccessOrganization = vi.fn();
const mockCapacidadFindOne = vi.fn();
const mockCapacidadCreate = vi.fn();
const mockActividadFindOne = vi.fn();
const mockBloqueFindOne = vi.fn();
const mockEventoOperativoSum = vi.fn();
vi.mock('@/modules/users/services/membership.service.js', () => ({
    assertIsAdmin: (...args) => mockAssertIsAdmin(...args),
}));
vi.mock('@/modules/organizations/services/organization.service.js', () => ({
    assertCanAccessOrganization: (...args) => mockAssertCanAccessOrganization(...args),
}));
vi.mock('@/modules/actividades/models/capacidad.model.js', () => ({
    Capacidad: {
        findOne: (...args) => mockCapacidadFindOne(...args),
        create: (...args) => mockCapacidadCreate(...args),
    },
}));
vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
    Actividad: {
        findOne: (...args) => mockActividadFindOne(...args),
    },
}));
vi.mock('@/modules/actividades/models/bloque.model.js', () => ({
    Bloque: {
        findOne: (...args) => mockBloqueFindOne(...args),
    },
}));
vi.mock('@/modules/eventos/models/evento-operativo.model.js', () => ({
    EventoOperativo: {
        sum: (...args) => mockEventoOperativoSum(...args),
    },
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
describe('capacidad.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertIsAdmin.mockResolvedValue(undefined);
        mockAssertCanAccessOrganization.mockResolvedValue(undefined);
        mockEventoOperativoSum.mockResolvedValue(0);
    });
    describe('createCapacidad', () => {
        const createData = {
            actividadId: ACTIVIDAD_ID,
            date: DateTime.fromISO('2025-02-01'),
            limit: 10,
        };
        it('throws when assertIsAdmin rejects', async () => {
            const { ForbiddenError } = await import('@/shared/errors/index.js');
            mockAssertIsAdmin.mockRejectedValueOnce(new ForbiddenError('No eres admin'));
            await expect(capacidadService.createCapacidad(createData, ORG_ID, USER_ID)).rejects.toThrow();
        });
        it('throws NotFoundError when actividad does not exist', async () => {
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.createCapacidad(createData, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ConflictError when capacity already exists for actividad and date', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
            });
            mockCapacidadFindOne.mockResolvedValueOnce({
                id: CAPACIDAD_ID,
                actividadId: ACTIVIDAD_ID,
                date: '2025-02-01',
                organizationId: ORG_ID,
            });
            await expect(capacidadService.createCapacidad(createData, ORG_ID, USER_ID)).rejects.toThrow(ConflictError);
        });
        it('creates capacidad and returns it on success', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
            });
            mockCapacidadFindOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
            const createdCapacidad = {
                id: CAPACIDAD_ID,
                actividadId: ACTIVIDAD_ID,
                date: '2025-02-01',
                limit: 10,
                organizationId: ORG_ID,
            };
            mockCapacidadCreate.mockResolvedValueOnce(createdCapacidad);
            const result = await capacidadService.createCapacidad(createData, ORG_ID, USER_ID);
            expect(mockCapacidadCreate).toHaveBeenCalledWith({
                organizationId: ORG_ID,
                actividadId: ACTIVIDAD_ID,
                date: '2025-02-01',
                limit: 10,
            });
            expect(result).toEqual(createdCapacidad);
        });
    });
    describe('updateCapacidad', () => {
        it('throws NotFoundError when capacidad does not exist', async () => {
            mockCapacidadFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.updateCapacidad(CAPACIDAD_ID, ORG_ID, { limit: 20 }, USER_ID)).rejects.toThrow(NotFoundError);
        });
        it('updates capacidad and returns it on success', async () => {
            const capacidadRecord = {
                id: CAPACIDAD_ID,
                actividadId: ACTIVIDAD_ID,
                date: '2025-02-01',
                limit: 10,
                organizationId: ORG_ID,
                Actividad: { id: ACTIVIDAD_ID },
                update: vi.fn().mockResolvedValue(undefined),
            };
            mockCapacidadFindOne.mockReset();
            mockCapacidadFindOne.mockResolvedValue(capacidadRecord);
            const result = await capacidadService.updateCapacidad(CAPACIDAD_ID, ORG_ID, { limit: 20 }, USER_ID);
            expect(capacidadRecord.update).toHaveBeenCalledWith({ limit: 20 });
            expect(result).toEqual(capacidadRecord);
        });
    });
    describe('verificarDisponibilidadPorBloque', () => {
        it('throws NotFoundError when actividad does not exist', async () => {
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.verificarDisponibilidadPorBloque(ACTIVIDAD_ID, BLOQUE_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError when actividad is not BLOQUES', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            await expect(capacidadService.verificarDisponibilidadPorBloque(ACTIVIDAD_ID, BLOQUE_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(ValidationError);
        });
        it('throws NotFoundError when bloque does not exist', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.verificarDisponibilidadPorBloque(ACTIVIDAD_ID, BLOQUE_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(NotFoundError);
        });
        it('returns disponible true when capacity available (uses bloque.capacity when no Capacidad)', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce({
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                capacity: 10,
            });
            mockCapacidadFindOne.mockResolvedValueOnce(null);
            mockEventoOperativoSum.mockResolvedValueOnce(3);
            const result = await capacidadService.verificarDisponibilidadPorBloque(ACTIVIDAD_ID, BLOQUE_ID, '2025-02-01', 5, ORG_ID);
            expect(result.disponible).toBe(true);
            expect(result.limite).toBe(10);
            expect(result.capacidadUsada).toBe(3);
            expect(result.capacidadDisponible).toBe(7);
        });
        it('returns disponible false when capacity exceeded', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindOne.mockResolvedValueOnce({
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                capacity: 10,
            });
            mockCapacidadFindOne.mockResolvedValueOnce(null);
            mockEventoOperativoSum.mockResolvedValueOnce(10);
            const result = await capacidadService.verificarDisponibilidadPorBloque(ACTIVIDAD_ID, BLOQUE_ID, '2025-02-01', 1, ORG_ID);
            expect(result.disponible).toBe(false);
            expect(result.capacidadDisponible).toBe(0);
        });
    });
    describe('verificarDisponibilidadPorDia', () => {
        it('throws NotFoundError when actividad does not exist', async () => {
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.verificarDisponibilidadPorDia(ACTIVIDAD_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(NotFoundError);
        });
        it('throws ValidationError when actividad is not HORARIO_LIBRE', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            await expect(capacidadService.verificarDisponibilidadPorDia(ACTIVIDAD_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(ValidationError);
        });
        it('throws NotFoundError when no capacidad defined for activity and date', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            mockCapacidadFindOne.mockResolvedValueOnce(null);
            await expect(capacidadService.verificarDisponibilidadPorDia(ACTIVIDAD_ID, '2025-02-01', 1, ORG_ID)).rejects.toThrow(NotFoundError);
        });
        it('returns disponible true when capacity available', async () => {
            mockActividadFindOne.mockResolvedValue({
                id: ACTIVIDAD_ID,
                organizationId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            mockCapacidadFindOne.mockResolvedValue({
                id: CAPACIDAD_ID,
                actividadId: ACTIVIDAD_ID,
                date: '2025-02-01',
                limit: 20,
                organizationId: ORG_ID,
            });
            mockEventoOperativoSum.mockResolvedValue(5);
            const result = await capacidadService.verificarDisponibilidadPorDia(ACTIVIDAD_ID, '2025-02-01', 10, ORG_ID);
            expect(result.disponible).toBe(true);
            expect(result.limite).toBe(20);
            expect(result.capacidadUsada).toBe(5);
            expect(result.capacidadDisponible).toBe(15);
        });
    });
});
//# sourceMappingURL=capacidad.service.test.js.map