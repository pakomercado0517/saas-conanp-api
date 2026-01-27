'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stripe_webhook_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      event_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'ID del evento en Stripe (evt_xxx) para idempotencia',
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tipo de evento (ej. payment_intent.succeeded)',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Timestamp de procesamiento',
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
    });

    await queryInterface.addIndex('stripe_webhook_events', ['event_id'], {
      name: 'idx_stripe_webhook_events_event_id',
      unique: true,
      comment: 'Índice único para idempotencia de eventos Stripe',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stripe_webhook_events');
  },
};
