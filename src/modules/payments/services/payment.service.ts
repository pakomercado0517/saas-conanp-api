import { Op, type Transaction } from 'sequelize';
import { sequelize } from '@/shared/database/index.js';
import type { UUID, PaymentStatus } from '@/shared/database/types.js';
import {
  Payment,
  type PaymentAttributes,
  type PaymentCreationAttributes,
} from '@/modules/payments/models/payment.model.js';
import { StripeWebhookEvent } from '@/modules/payments/models/stripe-webhook-event.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { markEventoPaid, unmarkEventoPaid } from '@/modules/eventos/services/evento.service.js';
import { Organization } from '@/modules/organizations/models/organization.model.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { stripeClient, handleStripeError } from '@/shared/stripe/index.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import type {
  CreatePaymentIntentDTO,
  ConfirmPaymentDTO,
  ListPaymentsDTO,
  ProcessRefundDTO,
} from '@/modules/payments/validators/payment.validator.js';
import { DateTime } from 'luxon';

/**
 * Helper interno: Obtiene un evento y valida que pertenezca a la organización
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Evento encontrado
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
const getEventoWithOrganization = async (
  eventoId: UUID,
  organizationId: UUID
): Promise<EventoOperativo> => {
  const evento = await EventoOperativo.findOne({
    where: {
      id: eventoId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!evento) {
    throw new NotFoundError('Evento', { eventoId, organizationId });
  }

  return evento;
};

/**
 * Helper interno: Guarda un pago en la base de datos
 *
 * @param data - Datos del pago a crear
 * @param transaction - Transacción opcional de Sequelize
 * @returns Pago creado
 */
const savePayment = async (
  data: PaymentCreationAttributes,
  transaction?: Transaction
): Promise<Payment> => {
  const payment = await Payment.create(
    {
      ...data,
      refundedAmount: 0,
      status: 'pending',
    },
    transaction ? { transaction } : {}
  );

  return payment;
};

/**
 * Crea un Payment Intent en Stripe y guarda el pago en la base de datos.
 * El pago se crea con estado 'pending' y se actualiza cuando se confirma.
 *
 * @param data - Datos para crear la intención de pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea el pago
 * @returns Pago creado con stripePaymentIntentId y clientSecret
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 * @throws {ValidationError} Si el monto no es válido
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentDTO,
  organizationId: UUID,
  userId: UUID
): Promise<Payment & { clientSecret: string }> => {
  // 1. Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // 2. Validar que el evento existe y pertenece a la organización
  await getEventoWithOrganization(data.eventoId, organizationId);

  // 3. Validar que el monto es válido (ya validado por Zod, pero verificar)
  if (data.amount <= 0) {
    throw new ValidationError('El monto debe ser mayor a cero', 'amount');
  }

  if (data.amount < 1) {
    throw new ValidationError('El monto mínimo es 1 centavo', 'amount');
  }

  // 4. Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // 5. Guardar pago en BD primero (para tener el ID)
    const payment = await savePayment(
      {
        organizationId,
        eventoId: data.eventoId,
        amount: data.amount,
        currency: data.currency,
        metadata: data.metadata || null,
        paymentMethod: data.paymentMethod || null,
        status: 'pending',
      },
      transaction
    );

    // 6. Crear PaymentIntent en Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripeClient.paymentIntents.create({
        amount: data.amount, // ya en centavos
        currency: data.currency.toLowerCase(), // Stripe espera minúsculas
        metadata: {
          organizationId,
          eventoId: data.eventoId,
          paymentId: payment.id,
          ...(data.metadata || {}),
        },
      });
    } catch (error) {
      // Si falla Stripe, hacer rollback y lanzar error
      await transaction.rollback();
      handleStripeError(error);
      throw error; // Nunca se ejecuta, pero TypeScript lo necesita
    }

    // 7. Actualizar pago con stripePaymentIntentId
    await payment.update(
      {
        stripePaymentIntentId: paymentIntent.id,
      },
      { transaction }
    );

    // 8. Commit de la transacción
    await transaction.commit();

    // 9. Recargar pago con relaciones
    await payment.reload({
      include: [
        { model: EventoOperativo, as: 'EventoOperativo' },
        { model: Organization, as: 'Organization' },
      ],
    });

    logger.info(
      {
        paymentId: payment.id,
        organizationId,
        eventoId: data.eventoId,
        amount: data.amount,
        currency: data.currency,
        stripePaymentIntentId: paymentIntent.id,
        userId,
      },
      'Payment Intent creado exitosamente'
    );

    // 10. Retornar pago con clientSecret
    return {
      ...payment.toJSON(),
      clientSecret: paymentIntent.client_secret || '',
    } as Payment & { clientSecret: string };
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Confirma un pago actualizando el PaymentIntent en Stripe y el registro en la BD.
 *
 * @param data - Datos para confirmar el pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que confirma el pago
 * @returns Pago actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 * @throws {ValidationError} Si el pago no está en estado válido para confirmar
 */
export const confirmPayment = async (
  data: ConfirmPaymentDTO,
  organizationId: UUID,
  userId: UUID
): Promise<Payment> => {
  // 1. Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // 2. Buscar pago por ID con filtro multi-tenant
  const payment = await Payment.findOne({
    where: {
      id: data.paymentId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!payment) {
    throw new NotFoundError('Pago', { paymentId: data.paymentId, organizationId });
  }

  // 3. Validar que el stripePaymentIntentId coincide
  if (payment.stripePaymentIntentId !== data.stripePaymentIntentId) {
    throw new ValidationError(
      'El ID de PaymentIntent no coincide con el pago',
      'stripePaymentIntentId'
    );
  }

  // 4. Validar que el pago está en estado válido para confirmar
  if (payment.status !== 'pending' && payment.status !== 'processing') {
    throw new ValidationError(
      `No se puede confirmar un pago en estado '${payment.status}'. Solo se pueden confirmar pagos en estado 'pending' o 'processing'`,
      'status'
    );
  }

  // 5. Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // 6. Confirmar PaymentIntent en Stripe
    let confirmedPaymentIntent;
    try {
      confirmedPaymentIntent = await stripeClient.paymentIntents.confirm(
        data.stripePaymentIntentId,
        {
          ...(data.paymentMethod && { payment_method: data.paymentMethod }),
        }
      );
    } catch (error) {
      await transaction.rollback();
      handleStripeError(error);
      throw error; // Nunca se ejecuta
    }

    // 7. Actualizar pago en BD
    const updateData: Partial<PaymentAttributes> = {
      status: confirmedPaymentIntent.status === 'succeeded' ? 'succeeded' : 'processing',
      paymentMethod: data.paymentMethod || payment.paymentMethod,
    };

    // Obtener charge ID si está disponible
    if (confirmedPaymentIntent.latest_charge) {
      const charge =
        typeof confirmedPaymentIntent.latest_charge === 'string'
          ? await stripeClient.charges.retrieve(confirmedPaymentIntent.latest_charge)
          : confirmedPaymentIntent.latest_charge;
      updateData.stripeChargeId = charge.id;
    }

    // Obtener customer ID si está disponible
    if (confirmedPaymentIntent.customer) {
      updateData.stripeCustomerId =
        typeof confirmedPaymentIntent.customer === 'string'
          ? confirmedPaymentIntent.customer
          : confirmedPaymentIntent.customer.id;
    }

    // Si falló, guardar razón
    if (
      confirmedPaymentIntent.status === 'requires_payment_method' ||
      confirmedPaymentIntent.last_payment_error
    ) {
      updateData.status = 'failed';
      updateData.failureReason =
        confirmedPaymentIntent.last_payment_error?.message || 'El pago falló';
    }

    await payment.update(updateData, { transaction });

    // 8. Commit de la transacción
    await transaction.commit();

    // 9. Recargar pago con relaciones
    await payment.reload({
      include: [
        { model: EventoOperativo, as: 'EventoOperativo' },
        { model: Organization, as: 'Organization' },
      ],
    });

    logger.info(
      {
        paymentId: payment.id,
        organizationId,
        stripePaymentIntentId: data.stripePaymentIntentId,
        status: payment.status,
        userId,
      },
      'Pago confirmado exitosamente'
    );

    if (confirmedPaymentIntent.status === 'succeeded') {
      await markEventoPaid(payment.eventoId, payment.organizationId);
    }

    return payment;
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Obtiene un pago por ID.
 * Valida que el pago pertenezca a la organización (multi-tenant).
 *
 * @param paymentId - ID del pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Pago encontrado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 */
export const getPaymentById = async (
  paymentId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<Payment> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Buscar pago con filtro multi-tenant obligatorio
  const payment = await Payment.findOne({
    where: {
      id: paymentId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!payment) {
    throw new NotFoundError('Pago', { paymentId, organizationId });
  }

  return payment;
};

/**
 * Lista pagos con paginación y filtros.
 * Todos los filtros son opcionales, pero siempre se filtra por organización (multi-tenant).
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de pagos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listPayments = async (
  organizationId: UUID,
  filters: ListPaymentsDTO,
  userId: UUID
): Promise<{ data: Payment[]; pagination: PaginationMeta }> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Construir query con filtro multi-tenant obligatorio
  const where: Record<string, unknown> = {
    organizationId, // Multi-tenant obligatorio
  };

  // Aplicar filtros opcionales
  if (filters.eventoId) {
    where['eventoId'] = filters.eventoId;
  }

  if (filters.status) {
    where['status'] = filters.status;
  }

  if (filters.currency) {
    where['currency'] = filters.currency;
  }

  // Filtros de rango de fechas
  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, unknown> = {};
    if (filters.dateFrom) {
      const dateFromStr =
        typeof filters.dateFrom === 'string' ? filters.dateFrom : filters.dateFrom.toISODate();
      dateFilter[Op.gte as unknown as string] = dateFromStr;
    }
    if (filters.dateTo) {
      const dateToStr =
        typeof filters.dateTo === 'string' ? filters.dateTo : filters.dateTo.toISODate();
      dateFilter[Op.lte as unknown as string] = dateToStr;
    }
    where['createdAt'] = dateFilter;
  }

  // Filtros de rango de montos (ya en centavos)
  if (filters.amountMin != null || filters.amountMax != null) {
    const amountFilter: Record<string, unknown> = {};
    if (filters.amountMin != null) {
      amountFilter[Op.gte as unknown as string] = filters.amountMin;
    }
    if (filters.amountMax != null) {
      amountFilter[Op.lte as unknown as string] = filters.amountMax;
    }
    where['amount'] = amountFilter;
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación
  const result = await Payment.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  const total = result.count as number;
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page: filters.page,
    limit,
    total,
    totalPages,
  };

  return { data: result.rows, pagination };
};

/**
 * Procesa un reembolso para un pago.
 * Puede ser reembolso total (si no se proporciona amount) o parcial (si se proporciona amount).
 *
 * @param data - Datos para procesar el reembolso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que procesa el reembolso
 * @returns Pago actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 * @throws {ValidationError} Si el pago no está en estado válido o el monto es inválido
 */
export const processRefund = async (
  data: ProcessRefundDTO,
  organizationId: UUID,
  userId: UUID
): Promise<Payment> => {
  // 1. Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // 2. Buscar pago por ID con filtro multi-tenant
  const payment = await Payment.findOne({
    where: {
      id: data.paymentId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!payment) {
    throw new NotFoundError('Pago', { paymentId: data.paymentId, organizationId });
  }

  // 3. Validar que el pago está en estado válido para reembolsar
  if (payment.status !== 'succeeded') {
    throw new ValidationError(
      `No se puede reembolsar un pago en estado '${payment.status}'. Solo se pueden reembolsar pagos en estado 'succeeded'`,
      'status'
    );
  }

  // 4. Validar que no se ha reembolsado completamente
  if (payment.refundedAmount >= payment.amount) {
    throw new ValidationError('Este pago ya ha sido reembolsado completamente', 'refundedAmount');
  }

  // 5. Calcular monto a reembolsar
  const availableAmount = payment.amount - payment.refundedAmount;
  const refundAmount = data.amount || availableAmount; // Si no se proporciona, reembolso total

  // 6. Validar que el monto a reembolsar no exceda el disponible
  if (refundAmount > availableAmount) {
    throw new ValidationError(
      `El monto a reembolsar (${refundAmount} centavos) excede el monto disponible (${availableAmount} centavos)`,
      'amount'
    );
  }

  if (refundAmount <= 0) {
    throw new ValidationError('El monto a reembolsar debe ser mayor a cero', 'amount');
  }

  // 7. Validar que existe stripePaymentIntentId
  if (!payment.stripePaymentIntentId) {
    throw new ValidationError(
      'No se puede procesar el reembolso: el pago no tiene un PaymentIntent de Stripe asociado',
      'stripePaymentIntentId'
    );
  }

  // 8. Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // 9. Crear refund en Stripe
    try {
      await stripeClient.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount, // en centavos
        reason: data.reason ? 'requested_by_customer' : 'requested_by_customer',
        metadata: {
          paymentId: payment.id,
          organizationId,
          reason: data.reason || '',
        },
      });
    } catch (error) {
      await transaction.rollback();
      handleStripeError(error);
      throw error; // Nunca se ejecuta
    }

    // 10. Actualizar pago en BD
    const newRefundedAmount = payment.refundedAmount + refundAmount;
    const isFullRefund = newRefundedAmount >= payment.amount;

    await payment.update(
      {
        refundedAmount: newRefundedAmount,
        refundedAt: DateTime.now().setZone('America/Mexico_City').toISODate() || null,
        status: isFullRefund ? 'refunded' : payment.status, // Solo cambiar a 'refunded' si es reembolso total
      },
      { transaction }
    );

    // 11. Commit de la transacción
    await transaction.commit();

    // 12. Recargar pago con relaciones
    await payment.reload({
      include: [
        { model: EventoOperativo, as: 'EventoOperativo' },
        { model: Organization, as: 'Organization' },
      ],
    });

    logger.info(
      {
        paymentId: payment.id,
        organizationId,
        refundAmount,
        refundedAmount: payment.refundedAmount,
        isFullRefund,
        userId,
      },
      'Reembolso procesado exitosamente'
    );

    if (isFullRefund) {
      await unmarkEventoPaid(payment.eventoId, payment.organizationId);
    }

    return payment;
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Idempotencia de webhooks Stripe.
 * Inserta el evento en stripe_webhook_events. Si ya existe (UniqueConstraintError),
 * devuelve true (omitir procesamiento). Si insert OK, devuelve false (procesar).
 *
 * @param eventId - ID del evento Stripe (evt_xxx)
 * @param eventType - Tipo de evento (ej. payment_intent.succeeded)
 * @returns true si el evento ya fue procesado (duplicado), false si es nuevo
 */
export const ensureEventIdempotency = async (
  eventId: string,
  eventType: string
): Promise<boolean> => {
  try {
    await StripeWebhookEvent.create({
      eventId,
      eventType,
      processedAt: new Date(),
    });
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return true;
    }
    throw error;
  }
};

/**
 * Actualiza el pago cuando Stripe envía charge.refunded.
 * Busca el pago por payment_intent del charge, actualiza refundedAmount, refundedAt
 * y status = 'refunded' si el reembolso es total.
 *
 * @param charge - Objeto charge del webhook (event.data.object)
 * @returns Pago actualizado o null si no se encuentra
 */
export const handleChargeRefundedFromWebhook = async (
  charge: Record<string, unknown>
): Promise<Payment | null> => {
  const paymentIntent =
    typeof charge['payment_intent'] === 'string'
      ? charge['payment_intent']
      : (charge['payment_intent'] as { id?: string })?.id;
  const amountRefunded =
    typeof charge['amount_refunded'] === 'number' ? charge['amount_refunded'] : 0;

  if (!paymentIntent || typeof paymentIntent !== 'string') {
    logger.warn(
      { chargeId: (charge['id'] as string) ?? 'unknown' },
      'Webhook charge.refunded: payment_intent ausente o inválido'
    );
    return null;
  }

  const payment = await Payment.findOne({
    where: { stripePaymentIntentId: paymentIntent },
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!payment) {
    logger.warn(
      { stripePaymentIntentId: paymentIntent, chargeId: charge['id'] },
      'Webhook charge.refunded: pago no encontrado'
    );
    return null;
  }

  const transaction = await sequelize.transaction();

  try {
    const isFullRefund = amountRefunded >= payment.amount;
    const updateData: Partial<PaymentAttributes> = {
      refundedAmount: amountRefunded,
      refundedAt: DateTime.now().setZone('America/Mexico_City').toISODate() ?? null,
      ...(isFullRefund ? { status: 'refunded' as PaymentStatus } : {}),
    };

    await payment.update(updateData, { transaction });
    await transaction.commit();

    await payment.reload({
      include: [
        { model: EventoOperativo, as: 'EventoOperativo' },
        { model: Organization, as: 'Organization' },
      ],
    });

    logger.info(
      {
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent,
        amountRefunded,
        isFullRefund,
        organizationId: payment.organizationId,
      },
      'Estado de pago actualizado desde webhook charge.refunded'
    );

    if (isFullRefund) {
      await unmarkEventoPaid(payment.eventoId, payment.organizationId);
    }

    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Actualiza el estado de un pago desde un webhook de Stripe.
 * Esta función NO valida acceso a organización ya que se llama directamente desde Stripe.
 *
 * @param stripePaymentIntentId - ID del PaymentIntent en Stripe
 * @param eventType - Tipo de evento de Stripe (payment_intent.succeeded, payment_intent.payment_failed, etc.)
 * @param eventData - Datos del evento de Stripe
 * @returns Pago actualizado con relaciones cargadas
 * @throws {NotFoundError} Si el pago no existe
 * @throws {ValidationError} Si el tipo de evento no es válido
 */
export const updatePaymentStatusFromWebhook = async (
  stripePaymentIntentId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<Payment> => {
  // 1. Buscar pago por stripePaymentIntentId (sin filtro multi-tenant inicial)
  const payment = await Payment.findOne({
    where: {
      stripePaymentIntentId,
    },
    include: [
      { model: EventoOperativo, as: 'EventoOperativo' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!payment) {
    throw new NotFoundError('Pago', { stripePaymentIntentId });
  }

  // 2. Mapear eventos de Stripe a estados
  let newStatus: PaymentStatus | null = null;
  let failureReason: string | null = null;
  let stripeChargeId: string | null = null;
  let paymentMethod: string | null = null;

  switch (eventType) {
    case 'payment_intent.succeeded':
      newStatus = 'succeeded';
      break;
    case 'payment_intent.payment_failed':
      newStatus = 'failed';
      failureReason =
        (eventData['last_payment_error'] as { message?: string })?.message || 'El pago falló';
      break;
    case 'payment_intent.canceled':
      newStatus = 'cancelled';
      break;
    case 'payment_intent.processing':
      newStatus = 'processing';
      break;
    default:
      // Si el evento no es relevante, no actualizar
      logger.warn(
        {
          stripePaymentIntentId,
          eventType,
          paymentId: payment.id,
        },
        'Tipo de evento de Stripe no reconocido para actualizar estado de pago'
      );
      return payment;
  }

  // 3. Extraer información adicional del evento
  if (eventData['latest_charge']) {
    stripeChargeId =
      typeof eventData['latest_charge'] === 'string'
        ? eventData['latest_charge']
        : (eventData['latest_charge'] as { id?: string })?.id || null;
  }

  if (eventData['payment_method']) {
    paymentMethod =
      typeof eventData['payment_method'] === 'string'
        ? eventData['payment_method']
        : (eventData['payment_method'] as { id?: string })?.id || null;
  }

  // 4. Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // 5. Actualizar pago en BD
    const updateData: Partial<PaymentAttributes> = {};

    if (newStatus) {
      updateData.status = newStatus;
    }

    if (stripeChargeId) {
      updateData.stripeChargeId = stripeChargeId;
    }

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await payment.update(updateData, { transaction });

    // 6. Commit de la transacción
    await transaction.commit();

    // 7. Recargar pago con relaciones
    await payment.reload({
      include: [
        { model: EventoOperativo, as: 'EventoOperativo' },
        { model: Organization, as: 'Organization' },
      ],
    });

    logger.info(
      {
        paymentId: payment.id,
        stripePaymentIntentId,
        eventType,
        newStatus,
        organizationId: payment.organizationId,
      },
      'Estado de pago actualizado desde webhook de Stripe'
    );

    if (eventType === 'payment_intent.succeeded' && payment.status === 'succeeded') {
      await markEventoPaid(payment.eventoId, payment.organizationId);
    }

    return payment;
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
};
