'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nombre del plan: básico, profesional, empresarial',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del plan',
      },
      priceMonthly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio mensual',
      },
      priceYearly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio anual',
      },
      stripePriceIdMonthly: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del precio en Stripe para mensual',
      },
      stripePriceIdYearly: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del precio en Stripe para anual',
      },
      stripeProductId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del producto en Stripe',
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Características del plan: límites, funcionalidades',
      },
      maxOrganizations: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo de organizaciones (null = ilimitado)',
      },
      maxUsers: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo de usuarios por organización',
      },
      maxEventos: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo de eventos por mes',
      },
      maxActividades: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo de actividades',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si el plan está disponible',
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

    await queryInterface.addIndex('subscription_plans', ['name'], {
      name: 'idx_subscription_plans_name',
      comment: 'Índice para búsquedas por nombre del plan',
    });

    await queryInterface.addIndex('subscription_plans', ['active'], {
      name: 'idx_subscription_plans_active',
      comment: 'Índice para filtrar planes disponibles',
    });

    await queryInterface.addIndex('subscription_plans', ['deletedAt'], {
      name: 'idx_subscription_plans_deleted_at',
      comment: 'Índice para filtrar planes no eliminados',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscription_plans');
  },
};
