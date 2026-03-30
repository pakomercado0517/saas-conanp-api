import type { UUID } from '../../../shared/database/types.js';
/**
 * Normaliza el nombre de actividad para emparejar entre áreas (misma dependencia).
 * Trim, colapsa espacios internos, minúsculas.
 */
export declare const normalizeActivityName: (name: string) => string;
export interface MatchedActividadRow {
    areaId: UUID;
    areaName: string;
    actividadId: UUID;
}
export interface MissingActividadArea {
    areaId: UUID;
    areaName: string;
}
/**
 * Resuelve, para cada área de la dependencia, la actividad cuyo nombre normalizado
 * coincide con la actividad de referencia. Si falta en alguna área, lanza ValidationError.
 */
export declare const findMatchingActividadesByDependencia: (dependenciaId: UUID, referenceActividadId: UUID) => Promise<MatchedActividadRow[]>;
//# sourceMappingURL=permiso-scope.helper.d.ts.map