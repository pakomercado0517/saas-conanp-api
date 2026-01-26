'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre de la organización (ANP)',
      },
      ecosystem_type: {
        type: Sequelize.ENUM('terrestre', 'maritimo', 'mixto'),
        allowNull: false,
        comment: 'Tipo de ecosistema de la ANP',
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Configuraciones específicas del ecosistema (reglas como datos)',
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

    // Índice para búsquedas por nombre
    await queryInterface.addIndex('organizations', ['name'], {
      name: 'idx_organizations_name',
      comment: 'Índice para búsquedas por nombre',
    });

    // Índice para búsquedas por tipo de ecosistema
    await queryInterface.addIndex('organizations', ['ecosystem_type'], {
      name: 'idx_organizations_ecosystem_type',
      comment: 'Índice para filtros por tipo de ecosistema',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organizations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organizations_ecosystem_type";');
  },
};
