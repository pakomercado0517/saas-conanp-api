'use strict';

/**
 * Seed: plan de suscripción FREE.
 *
 * Crea el plan "free" con límites mínimos para que una organización pueda iniciar
 * (primer admin por invitación, pocos eventos y actividades). Precio 0, sin Stripe.
 *
 * Límites:
 *   - maxUsers: 2
 *   - maxEventos: 5 (por periodo)
 *   - maxActividades: 2
 *
 * Si el plan "free" ya existe (mismo name), el seed no hace nada.
 */
const crypto = require('crypto');

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM subscription_plans WHERE name = :name AND "deletedAt" IS NULL',
      {
        replacements: { name: 'free' },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (existing) {
      console.warn('Seed subscription-plan-free: el plan "free" ya existe. Saltando.');
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await queryInterface.bulkInsert('subscription_plans', [
      {
        id,
        name: 'free',
        description: 'Plan gratuito para comenzar. Incluye límites básicos de usuarios, eventos y actividades.',
        priceMonthly: 0,
        priceYearly: 0,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
        stripeProductId: null,
        features: null,
        maxOrganizations: null,
        maxUsers: 2,
        maxEventos: 5,
        maxActividades: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);

    console.log('Seed subscription-plan-free: plan "free" creado (maxUsers: 2, maxEventos: 5, maxActividades: 2).');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DELETE FROM subscription_plans WHERE name = :name',
      {
        replacements: { name: 'free' },
      }
    );
  },
};
