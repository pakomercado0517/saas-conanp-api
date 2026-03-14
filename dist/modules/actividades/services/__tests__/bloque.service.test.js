import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { NotFoundError, ValidationError } from '../../../../shared/errors/index.js';
import * as bloqueService from '../bloque.service.js';
const ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ACTIVIDAD_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const BLOQUE_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const TEMPLATE_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const mockAssertCanAccessOrganization = vi.fn();
const mockAssertIsAdmin = vi.fn();
const mockActividadFindOne = vi.fn();
const mockBloqueFindOne = vi.fn();
const mockBloqueFindAll = vi.fn();
const mockBloqueCount = vi.fn();
const mockBloqueCreate = vi.fn();
const mockBloqueFindAndCountAll = vi.fn();
vi.mock('@/modules/organizations/services/organization.service.js', () => ({
    assertCanAccessOrganization: (...args) => mockAssertCanAccessOrganization(...args),
}));
vi.mock('@/modules/users/services/membership.service.js', () => ({
    assertIsAdmin: (...args) => mockAssertIsAdmin(...args),
}));
vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
    Actividad: {
        findOne: (...args) => mockActividadFindOne(...args),
    },
}));
vi.mock('@/modules/actividades/models/bloque.model.js', () => ({
    Bloque: {
        findOne: (...args) => mockBloqueFindOne(...args),
        findAll: (...args) => mockBloqueFindAll(...args),
        count: (...args) => mockBloqueCount(...args),
        create: (...args) => mockBloqueCreate(...args),
        findAndCountAll: (...args) => mockBloqueFindAndCountAll(...args),
    },
}));
vi.mock('@/shared/logger/index.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnThis() },
}));
describe('bloque.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertCanAccessOrganization.mockResolvedValue(undefined);
        mockAssertIsAdmin.mockResolvedValue(undefined);
    });
    describe('listBloquesByActividad (materialización bajo demanda)', () => {
        const baseFilters = {
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            date: undefined,
        };
        it('no materializa cuando no se envía date', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                areaId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindAndCountAll.mockResolvedValueOnce({ rows: [], count: 0 });
            await bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters }, USER_ID);
            expect(mockBloqueFindAll).not.toHaveBeenCalled();
            expect(mockBloqueCount).not.toHaveBeenCalled();
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
        it('no materializa cuando la actividad es HORARIO_LIBRE', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                areaId: ORG_ID,
                agendaType: 'HORARIO_LIBRE',
            });
            mockBloqueFindAndCountAll.mockResolvedValueOnce({ rows: [], count: 0 });
            await bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters, date: DateTime.fromISO('2026-01-15') }, USER_ID);
            expect(mockBloqueFindAll).not.toHaveBeenCalled();
            expect(mockBloqueCount).not.toHaveBeenCalled();
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
        it('no materializa cuando la actividad tiene plantillas pero ya hay bloques para esa fecha', async () => {
            const template = {
                id: TEMPLATE_ID,
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                date: null,
                startTime: '09:00:00',
                endTime: '13:00:00',
                capacity: 10,
                isTemplate: true,
            };
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                areaId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindAll.mockResolvedValueOnce([template]);
            mockBloqueCount.mockResolvedValueOnce(2);
            const existingBloques = [
                { id: BLOQUE_ID, actividadId: ACTIVIDAD_ID, date: '2026-01-15', isTemplate: false },
                {
                    id: '22222222-2222-2222-2222-222222222222',
                    actividadId: ACTIVIDAD_ID,
                    date: '2026-01-15',
                    isTemplate: false,
                },
            ];
            mockBloqueFindAndCountAll.mockResolvedValueOnce({ rows: existingBloques, count: 2 });
            const result = await bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters, date: DateTime.fromISO('2026-01-15') }, USER_ID);
            expect(mockBloqueCreate).not.toHaveBeenCalled();
            expect(result.data).toHaveLength(2);
            expect(result.data).toEqual(existingBloques);
        });
        it('materializa bloques desde plantillas cuando hay fecha, actividad BLOQUES, plantillas y no hay bloques para esa fecha', async () => {
            const template1 = {
                id: TEMPLATE_ID,
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                date: null,
                startTime: '09:00:00',
                endTime: '13:00:00',
                capacity: 10,
                isTemplate: true,
            };
            const template2 = {
                id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                date: null,
                startTime: '14:00:00',
                endTime: '18:00:00',
                capacity: 5,
                isTemplate: true,
            };
            const created1 = {
                ...template1,
                id: '11111111-1111-1111-1111-111111111111',
                date: '2026-01-15',
                startTime: '09:00:00',
                endTime: '13:00:00',
                isTemplate: false,
            };
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                areaId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            // 1) getBloquesTemplates -> findAll
            // 2) materializeBloqueFromTemplate(template1) -> validateNoTimeOverlap -> findAll (no existing)
            // 3) materializeBloqueFromTemplate(template2) -> validateNoTimeOverlap -> findAll (created1 exists)
            mockBloqueFindAll
                .mockResolvedValueOnce([template1, template2])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([created1]);
            mockBloqueCount.mockResolvedValueOnce(0);
            mockBloqueCreate.mockResolvedValueOnce(created1).mockResolvedValueOnce({
                ...template2,
                id: '22222222-2222-2222-2222-222222222222',
                date: '2026-01-15',
                isTemplate: false,
            });
            const createdRows = [
                { id: '11111111-1111-1111-1111-111111111111', date: '2026-01-15', isTemplate: false },
                { id: '22222222-2222-2222-2222-222222222222', date: '2026-01-15', isTemplate: false },
            ];
            mockBloqueFindAndCountAll.mockResolvedValueOnce({ rows: createdRows, count: 2 });
            const result = await bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters, date: DateTime.fromISO('2026-01-15') }, USER_ID);
            expect(mockBloqueCreate).toHaveBeenCalledTimes(2);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
        });
        it('no materializa cuando la actividad tiene tipo BLOQUES pero no tiene plantillas', async () => {
            mockActividadFindOne.mockResolvedValueOnce({
                id: ACTIVIDAD_ID,
                areaId: ORG_ID,
                agendaType: 'BLOQUES',
            });
            mockBloqueFindAll.mockResolvedValueOnce([]);
            mockBloqueFindAndCountAll.mockResolvedValueOnce({ rows: [], count: 0 });
            await bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters, date: DateTime.fromISO('2026-01-15') }, USER_ID);
            expect(mockBloqueCount).not.toHaveBeenCalled();
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
        it('lanza NotFoundError cuando la actividad no existe', async () => {
            mockActividadFindOne.mockResolvedValueOnce(null);
            await expect(bloqueService.listBloquesByActividad(ACTIVIDAD_ID, ORG_ID, { ...baseFilters, date: DateTime.fromISO('2026-01-15') }, USER_ID)).rejects.toThrow(NotFoundError);
            expect(mockBloqueFindAll).not.toHaveBeenCalled();
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
    });
    describe('createBloqueFromTemplate', () => {
        it('crea un bloque desde plantilla y lo devuelve (usa materializeBloqueFromTemplate)', async () => {
            const template = {
                id: TEMPLATE_ID,
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                date: null,
                startTime: '09:00:00',
                endTime: '13:00:00',
                capacity: 10,
                isTemplate: true,
                Actividad: { agendaType: 'BLOQUES' },
            };
            const created = {
                id: BLOQUE_ID,
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                date: '2026-01-20',
                startTime: '09:00:00',
                endTime: '13:00:00',
                capacity: 10,
                isTemplate: false,
            };
            mockBloqueFindOne.mockResolvedValueOnce(template);
            // validateNoTimeOverlap inside materializeBloqueFromTemplate calls Bloque.findAll
            mockBloqueFindAll.mockResolvedValueOnce([]);
            mockBloqueCreate.mockResolvedValueOnce(created);
            const result = await bloqueService.createBloqueFromTemplate({ templateId: TEMPLATE_ID, date: DateTime.fromISO('2026-01-20') }, ORG_ID, USER_ID);
            expect(mockAssertIsAdmin).toHaveBeenCalledWith(USER_ID, ORG_ID);
            expect(mockBloqueCreate).toHaveBeenCalledTimes(1);
            expect(result).toEqual(created);
            expect(result.date).toBe('2026-01-20');
            expect(result.isTemplate).toBe(false);
        });
        it('lanza NotFoundError cuando la plantilla no existe', async () => {
            mockBloqueFindOne.mockResolvedValueOnce(null);
            await expect(bloqueService.createBloqueFromTemplate({ templateId: TEMPLATE_ID, date: DateTime.fromISO('2026-01-20') }, ORG_ID, USER_ID)).rejects.toThrow(NotFoundError);
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
        it('lanza ValidationError cuando la actividad de la plantilla no es BLOQUES', async () => {
            mockBloqueFindOne.mockResolvedValueOnce({
                id: TEMPLATE_ID,
                actividadId: ACTIVIDAD_ID,
                areaId: ORG_ID,
                isTemplate: true,
                Actividad: { agendaType: 'HORARIO_LIBRE' },
            });
            await expect(bloqueService.createBloqueFromTemplate({ templateId: TEMPLATE_ID, date: DateTime.fromISO('2026-01-20') }, ORG_ID, USER_ID)).rejects.toThrow(ValidationError);
            expect(mockBloqueCreate).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=bloque.service.test.js.map