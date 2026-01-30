'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Organización con la suscripción (una por organización)',
      },
      planId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscription_plans',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Plan de suscripción',
      },
      status: {
        type: Sequelize.ENUM(
          'active',
          'canceled',
          'past_due',
          'unpaid',
          'trialing',
          'incomplete',
          'incomplete_expired'
        ),
        allowNull: false,
        comment: 'Estado de la suscripción',
      },
      billingCycle: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        comment: 'Ciclo de facturación',
      },
      currentPeriodStart: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Inicio del periodo actual',
      },
      currentPeriodEnd: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fin del periodo actual',
      },
      cancelAtPeriodEnd: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se cancelará al final del periodo',
      },
      canceledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación',
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        comment: 'ID de la suscripción en Stripe',
      },
      stripeCustomerId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del cliente en Stripe',
      },
      stripePriceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del precio actual en Stripe',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Datos adicionales',
      },
      trialEnd: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fin del período de prueba',
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

    await queryInterface.addIndex('subscriptions', ['organizationId'], {
      name: 'idx_subscriptions_organization_id',
      comment: 'Índice para búsquedas por organización',
    });

    await queryInterface.addIndex('subscriptions', ['status'], {
      name: 'idx_subscriptions_status',
      comment: 'Índice para filtros por estado',
    });

    await queryInterface.addIndex('subscriptions', ['stripeSubscriptionId'], {
      name: 'idx_subscriptions_stripe_subscription_id',
      comment: 'Índice para lookups por Stripe Subscription ID',
    });

    await queryInterface.addIndex('subscriptions', ['currentPeriodEnd'], {
      name: 'idx_subscriptions_current_period_end',
      comment: 'Índice para renovaciones y expiraciones',
    });

    await queryInterface.addIndex('subscriptions', ['deletedAt'], {
      name: 'idx_subscriptions_deleted_at',
      comment: 'Índice para filtrar suscripciones no eliminadas',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscriptions');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_subscriptions_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_subscriptions_billingCycle";'
    );
  },
};
