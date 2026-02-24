import type { Request, Response } from 'express';
import * as capacidadService from '../services/capacidad.service.js';
import { sendSuccess, sendCreated } from '@/shared/responses/helpers.js';
import type { CreateCapacidadDTO } from '@/modules/capacidad/validators/capacidad.validator.js';
import { ConflictError, ValidationError } from '@/shared/errors/index.js';
import { Capacidad } from '../models/capacidad.model.js';
import { Actividad } from '../models/actividad.model.js';
import { toDateOnlyDB } from '@/shared/dates/index.js';

/**
 * Crea o actualiza una capacidad para una actividad y fecha.
 * Si ya existe una capacidad para esa actividad y fecha, la actualiza.
 * Solo los administradores pueden crear/actualizar capacidades.
 *
 * POST /api/v1/actividades/:actividadId/capacidad
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - date: string YYYY-MM-DD (requerido)
 * - limit: number (requerido, mínimo: 1)
 *
 * Respuesta 201 (creada) o 200 (actualizada):
 * {
 *   success: true,
 *   data: Capacidad,
 *   message: "Capacidad creada/actualizada exitosamente"
 * }
 */
export const createOrUpdateCapacidad = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const actividadId = req.params['actividadId'] as string;
  const userId = req.user.userId;

  // Construir CreateCapacidadDTO con actividadId del parámetro y datos del body
  const data: CreateCapacidadDTO = {
    actividadId,
    date: req.body['date'],
    limit: req.body['limit'],
  };

  try {
    // Intentar crear capacidad
    const capacidad = await capacidadService.createCapacidad(data, organizationId, userId);
    return sendCreated(res, capacidad, 'Capacidad creada exitosamente');
  } catch (error) {
    // Si falla con ConflictError, significa que ya existe una capacidad
    // Buscar la capacidad existente y actualizarla
    if (error instanceof ConflictError) {
      // Convertir fecha a string para buscar
      const dateStr = toDateOnlyDB(data['date']);
      if (!dateStr) {
        throw new ValidationError('La fecha proporcionada no es válida');
      }

      // Buscar capacidad existente
      const existingCapacidad = await Capacidad.findOne({
        where: {
          actividadId,
          date: dateStr,
          areaId: organizationId,
        },
      });

      if (!existingCapacidad) {
        // Si no se encuentra, relanzar el error original
        throw error;
      }

      // Actualizar la capacidad existente
      const updatedCapacidad = await capacidadService.updateCapacidad(
        existingCapacidad.id,
        organizationId,
        {
          limit: data.limit,
        },
        userId
      );

      return sendSuccess(res, updatedCapacidad, 'Capacidad actualizada exitosamente');
    }

    // Si es otro tipo de error, relanzarlo
    throw error;
  }
};

/**
 * Verifica disponibilidad de capacidad para una actividad.
 * Determina automáticamente si debe verificar por bloque (BLOQUES) o por día (HORARIO_LIBRE).
 *
 * GET /api/v1/actividades/:actividadId/capacidad/verificar
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Query:
 * - date: string YYYY-MM-DD (requerido)
 * - bloqueId: UUID (opcional, requerido si agendaType = BLOQUES)
 * - cantidad: number (opcional, default: 1, mínimo: 1)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     disponible: boolean,
 *     capacidadTotal: number,
 *     capacidadUsada: number,
 *     capacidadDisponible: number,
 *     limite: number
 *   },
 *   message: "Disponibilidad verificada exitosamente"
 * }
 */
export const verificarDisponibilidad = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const actividadId = req.params['actividadId'] as string;

  // Extraer query params
  const date = req.query['date'] as string | undefined;
  const bloqueId = req.query['bloqueId'] as string | undefined;
  const cantidad = req.query['cantidad'] ? Number.parseInt(req.query['cantidad'] as string, 10) : 1;

  // Validar que date esté presente
  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: 'El parámetro date es requerido en los query params',
      code: 'VALIDATION_ERROR',
    });
  }

  // Obtener actividad para determinar agendaType
  const actividad = await Actividad.findOne({
    where: {
      id: actividadId,
      areaId: organizationId,
    },
  });

  if (!actividad) {
    return res.status(404).json({
      success: false,
      error: 'No encontrado',
      message: 'Actividad no encontrada',
      code: 'NOT_FOUND',
    });
  }

  // Determinar qué función del service llamar según el tipo de agenda
  let resultado;
  if (actividad.agendaType === 'BLOQUES') {
    // Para BLOQUES, validar que bloqueId esté presente
    if (!bloqueId) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'El parámetro bloqueId es requerido para actividades con tipo de agenda BLOQUES',
        code: 'VALIDATION_ERROR',
      });
    }

    resultado = await capacidadService.verificarDisponibilidadPorBloque(
      actividadId,
      bloqueId,
      date,
      cantidad,
      organizationId
    );
  } else if (actividad.agendaType === 'HORARIO_LIBRE') {
    resultado = await capacidadService.verificarDisponibilidadPorDia(
      actividadId,
      date,
      cantidad,
      organizationId
    );
  } else {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: `Tipo de agenda no válido: ${actividad.agendaType}`,
      code: 'VALIDATION_ERROR',
    });
  }

  return sendSuccess(res, resultado, 'Disponibilidad verificada exitosamente');
};
