import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { ValidationError } from '@/shared/errors/index.js';

/**
 * Normaliza el nombre de actividad para emparejar entre áreas (misma dependencia).
 * Trim, colapsa espacios internos, minúsculas.
 */
export const normalizeActivityName = (name: string): string =>
  name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-MX');

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
export const findMatchingActividadesByDependencia = async (
  dependenciaId: UUID,
  referenceActividadId: UUID
): Promise<MatchedActividadRow[]> => {
  const reference = await Actividad.findByPk(referenceActividadId);
  if (!reference) {
    throw new ValidationError('La actividad de referencia no existe', undefined, {
      actividadId: referenceActividadId,
    });
  }

  const refArea = await Area.findByPk(reference.areaId);
  if (!refArea || refArea.dependenciaId !== dependenciaId) {
    throw new ValidationError(
      'La actividad de referencia no pertenece a una área de esta dependencia',
      undefined,
      {
        actividadId: referenceActividadId,
        dependenciaId,
      }
    );
  }

  const refNorm = normalizeActivityName(reference.name);

  const areas = await Area.findAll({
    where: { dependenciaId },
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  });

  if (areas.length === 0) {
    throw new ValidationError('La dependencia no tiene áreas registradas', undefined, {
      dependenciaId,
    });
  }

  const areaIds = areas.map((a) => a.id);
  const actividades = await Actividad.findAll({
    where: { areaId: { [Op.in]: areaIds } },
  });

  const byArea = new Map<UUID, Actividad[]>();
  for (const act of actividades) {
    const list = byArea.get(act.areaId) ?? [];
    list.push(act);
    byArea.set(act.areaId, list);
  }

  const matched: MatchedActividadRow[] = [];
  const missing: MissingActividadArea[] = [];

  for (const area of areas) {
    const list = byArea.get(area.id) ?? [];
    const found = list.find((a) => normalizeActivityName(a.name) === refNorm);
    if (!found) {
      missing.push({ areaId: area.id, areaName: area.name });
    } else {
      matched.push({
        areaId: area.id,
        areaName: area.name,
        actividadId: found.id,
      });
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(
      'No existe una actividad con el mismo nombre en todas las áreas de la dependencia. Ajusta los nombres o crea la actividad faltante.',
      undefined,
      {
        referenceName: reference.name,
        missingAreas: missing,
      }
    );
  }

  return matched;
};
