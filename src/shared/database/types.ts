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

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type SubscriptionPlanName = 'free' | 'básico' | 'profesional' | 'empresarial';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingCycle = 'monthly' | 'yearly';

/** Tipo de producto de acceso (brazalete o pasaporte turístico) */
export type ProductoAccesoTipo = 'brazalete' | 'pasaporte';

/** Tipo de movimiento de stock (entrada o salida) */
export type MovimientoStockTipo = 'entrada' | 'salida';

/** Motivo del movimiento de stock */
export type MovimientoStockMotivo = 'compra' | 'venta' | 'ajuste' | 'devolucion';
