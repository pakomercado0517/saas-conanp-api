/**
 * Tipos compartidos para la base de datos
 */
export type UUID = string;
export type Status = 'activo' | 'inactivo' | 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
export type EcosystemType = 'terrestre' | 'maritimo' | 'mixto';
export type AgendaType = 'BLOQUES' | 'HORARIO_LIBRE';
export type ActividadType = 'terrestre' | 'maritima' | 'mixta';
export type ActivoType = 'embarcacion' | 'vehiculo' | 'guia' | 'equipo';
export type EventoStatus = 'programado' | 'en_curso' | 'completado' | 'cancelado';
export type Role = 'admin' | 'gestor' | 'prestador' | 'observador';
//# sourceMappingURL=types.d.ts.map