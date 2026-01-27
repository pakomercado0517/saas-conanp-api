'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Organización a la que pertenece el pago (multi-tenant)',
      },
      eventoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'eventos_operativos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Evento operativo asociado al pago',
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Monto en centavos (alineado con Stripe)',
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Moneda ISO 4217 (MXN, USD, etc.)',
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'processing',
          'succeeded',
          'failed',
          'refunded',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del pago',
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del PaymentIntent en Stripe (pi_xxx)',
      },
      stripeChargeId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del cargo en Stripe',
      },
      stripeCustomerId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del cliente en Stripe',
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Método de pago (card, oxxo, spei, etc.)',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Datos adicionales',
      },
      failureReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo de fallo (cuando status = failed)',
      },
      refundedAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Monto reembolsado en centavos',
      },
      refundedAt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha de reembolso',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete: fecha de eliminación',
      },
    });

    await queryInterface.addIndex('payments', ['organizationId'], {
      name: 'idx_payments_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    await queryInterface.addIndex('payments', ['eventoId'], {
      name: 'idx_payments_evento',
      comment: 'Índice para búsquedas por evento',
    });

    await queryInterface.addIndex('payments', ['stripePaymentIntentId'], {
      name: 'idx_payments_stripe_payment_intent',
      comment: 'Índice para lookups por Stripe PaymentIntent',
    });

    await queryInterface.addIndex('payments', ['status'], {
      name: 'idx_payments_status',
      comment: 'Índice para filtros por estado',
    });

    await queryInterface.addIndex('payments', ['deletedAt'], {
      name: 'idx_payments_deleted_at',
      comment: 'Índice para filtrar pagos no eliminados',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_payments_status";'
    );
  },
};
