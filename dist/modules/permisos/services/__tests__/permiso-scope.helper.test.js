import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError } from '../../../../shared/errors/index.js';
import { normalizeActivityName, findMatchingActividadesByDependencia, } from '../permiso-scope.helper.js';
const DEP_ID = '11111111-1111-1111-1111-111111111111';
const AREA1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const AREA2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const REF_ACT = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const ACT_A1 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const ACT_A2 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const mockActividadFindByPk = vi.fn();
const mockAreaFindByPk = vi.fn();
const mockAreaFindAll = vi.fn();
const mockActividadFindAll = vi.fn();
vi.mock('@/modules/areas/models/area.model.js', () => ({
    Area: {
        findByPk: (...args) => mockAreaFindByPk(...args),
        findAll: (...args) => mockAreaFindAll(...args),
    },
}));
vi.mock('@/modules/actividades/models/actividad.model.js', () => ({
    Actividad: {
        findByPk: (...args) => mockActividadFindByPk(...args),
        findAll: (...args) => mockActividadFindAll(...args),
    },
}));
describe('permiso-scope.helper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('normalizeActivityName', () => {
        it('recorta, colapsa espacios y pasa a minúsculas (locale)', () => {
            expect(normalizeActivityName('  Guía   Ecológica  ')).toBe('guía ecológica');
        });
    });
    describe('findMatchingActividadesByDependencia', () => {
        it('devuelve una fila por área cuando el nombre normalizado coincide', async () => {
            mockActividadFindByPk.mockResolvedValue({
                id: REF_ACT,
                name: 'Guía',
                areaId: AREA1,
            });
            mockAreaFindByPk.mockResolvedValue({ id: AREA1, dependenciaId: DEP_ID });
            mockAreaFindAll.mockResolvedValue([
                { id: AREA1, name: 'Norte' },
                { id: AREA2, name: 'Sur' },
            ]);
            mockActividadFindAll.mockResolvedValue([
                { id: ACT_A1, areaId: AREA1, name: 'Guía' },
                { id: ACT_A2, areaId: AREA2, name: '  guía  ' },
            ]);
            const rows = await findMatchingActividadesByDependencia(DEP_ID, REF_ACT);
            expect(rows).toHaveLength(2);
            expect(rows.map((r) => r.actividadId).sort()).toEqual([ACT_A1, ACT_A2].sort());
        });
        it('lanza ValidationError si falta actividad con el mismo nombre en algún área', async () => {
            mockActividadFindByPk.mockResolvedValue({
                id: REF_ACT,
                name: 'Senderismo',
                areaId: AREA1,
            });
            mockAreaFindByPk.mockResolvedValue({ id: AREA1, dependenciaId: DEP_ID });
            mockAreaFindAll.mockResolvedValue([
                { id: AREA1, name: 'Norte' },
                { id: AREA2, name: 'Sur' },
            ]);
            mockActividadFindAll.mockResolvedValue([{ id: ACT_A1, areaId: AREA1, name: 'Senderismo' }]);
            await expect(findMatchingActividadesByDependencia(DEP_ID, REF_ACT)).rejects.toThrow(ValidationError);
        });
    });
});
//# sourceMappingURL=permiso-scope.helper.test.js.map