'use strict';

/**
 * Seed: planes de suscripción (Free, Básico, Profesional, Empresarial, Enterprise).
 *
 * Precios mensuales en MXN. Idempotente: hace upsert por nombre de plan.
 * - Free: $0
 * - Básico: $5,000/mes
 * - Profesional: $10,000/mes
 * - Empresarial: $30,000/mes
 * - Enterprise: A medida (precio 0, cotización personalizada)
 */
const crypto = require('crypto');

const PLANS = [
  {
    name: 'free',
    description:
      'Plan gratuito para comenzar. Incluye límites básicos de usuarios, eventos y actividades.',
    priceMonthly: 0,
    priceYearly: 0,
    maxUsers: 3,
    maxEventos: 1,
    maxActividades: 1,
    maxOrganizations: null,
    features: {
      limits: { areas: 1, prestadores: 1, activos: 1 },
      functionalities: ['gestion_basica', 'reportes_estandar'],
    },
  },
  {
    name: 'básico',
    description: 'Para una ANP pequeña con pocos prestadores. Ideal para arranque operativo.',
    priceMonthly: 5000,
    priceYearly: 60000, // 5000 * 12
    maxUsers: 10,
    maxEventos: 1000,
    maxActividades: 15,
    maxOrganizations: null,
    features: {
      limits: { areas: 5, prestadores: 30, activos: 50 },
      functionalities: ['gestion_basica', 'reportes_estandar', 'capacidad_bloques', 'brazaletes'],
    },
  },
  {
    name: 'profesional',
    description: 'Para ANP mediana con mayor volumen de prestadores y actividades.',
    priceMonthly: 10000,
    priceYearly: 120000, // 10000 * 12
    maxUsers: 50,
    maxEventos: 5000,
    maxActividades: 40,
    maxOrganizations: null,
    features: {
      limits: { areas: 15, prestadores: 150, activos: 300 },
      functionalities: [
        'gestion_basica',
        'reportes_estandar',
        'reportes_avanzados',
        'exportacion_csv',
        'capacidad_bloques',
        'brazaletes',
      ],
    },
  },
  {
    name: 'empresarial',
    description: 'Para ANP grande o crítica, con alta operación y fiscalización.',
    priceMonthly: 30000,
    priceYearly: 360000, // 30000 * 12
    maxUsers: 150,
    maxEventos: 20000,
    maxActividades: 120,
    maxOrganizations: null,
    features: {
      limits: { areas: 50, prestadores: 500, activos: 1000 },
      functionalities: [
        'gestion_basica',
        'reportes_estandar',
        'reportes_avanzados',
        'exportacion_csv',
        'auditoria_avanzada',
        'api_completa',
        'sandbox',
        'capacidad_bloques',
        'brazaletes',
      ],
    },
  },
  {
    name: 'enterprise',
    description:
      'Contrato a medida para múltiples dependencias/ANP. Cotización personalizada.',
    priceMonthly: null,
    priceYearly: null,
    maxUsers: null,
    maxEventos: null,
    maxActividades: null,
    maxOrganizations: null,
    features: {
      limits: {},
      functionalities: [
        'cotizacion_personalizada',
        'multi_dependencia',
        'integraciones_dedicadas',
        'soporte_prioritario',
        'sandbox_multiple',
      ],
    },
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const plan of PLANS) {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM subscription_plans WHERE name = :name AND "deletedAt" IS NULL',
        {
          replacements: { name: plan.name },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      const row = {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
        stripeProductId: null,
        features: JSON.stringify(plan.features),
        maxOrganizations: plan.maxOrganizations,
        maxUsers: plan.maxUsers,
        maxEventos: plan.maxEventos,
        maxActividades: plan.maxActividades,
        active: true,
        updatedAt: now,
      };

      if (existing) {
        await queryInterface.sequelize.query(
          `UPDATE subscription_plans SET
            description = :description,
            "priceMonthly" = :priceMonthly,
            "priceYearly" = :priceYearly,
            features = :features::jsonb,
            "maxOrganizations" = :maxOrganizations,
            "maxUsers" = :maxUsers,
            "maxEventos" = :maxEventos,
            "maxActividades" = :maxActividades,
            "updatedAt" = :updatedAt
          WHERE id = :id`,
          {
            replacements: {
              id: existing.id,
              description: row.description,
              priceMonthly: row.priceMonthly,
              priceYearly: row.priceYearly,
              features: row.features,
              maxOrganizations: row.maxOrganizations,
              maxUsers: row.maxUsers,
              maxEventos: row.maxEventos,
              maxActividades: row.maxActividades,
              updatedAt: row.updatedAt,
            },
          }
        );
        console.log(`Seed subscription-plans: plan "${plan.name}" actualizado.`);
      } else {
        const id = crypto.randomUUID();
        await queryInterface.bulkInsert('subscription_plans', [
          {
            id,
            ...row,
            createdAt: now,
            deletedAt: null,
          },
        ]);
        console.log(`Seed subscription-plans: plan "${plan.name}" creado.`);
      }
    }
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    const names = PLANS.map((p) => p.name);
    await queryInterface.bulkDelete('subscription_plans', {
      name: { [Op.in]: names },
    });
  },
};
