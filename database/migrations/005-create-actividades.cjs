'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('actividades', {
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
        comment: 'Organización a la que pertenece la actividad',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre de la actividad turística',
      },
      type: {
        type: Sequelize.ENUM('terrestre', 'maritima', 'mixta'),
        allowNull: false,
        comment: 'Tipo de actividad (terrestre, marítima o mixta)',
      },
      agendaType: {
        type: Sequelize.ENUM('BLOQUES', 'HORARIO_LIBRE'),
        allowNull: false,
        comment: 'Tipo de agenda: BLOQUES (bloques predefinidos) o HORARIO_LIBRE (horario libre)',
      },
      requiresGuide: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la actividad requiere guía obligatorio',
      },
      impactLevel: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Nivel de impacto ambiental (configurable por organización)',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la actividad está activa',
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

    // Índice para búsquedas por organización (multi-tenant obligatorio)
    await queryInterface.addIndex('actividades', ['organizationId'], {
      name: 'idx_actividades_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    // Índice compuesto para búsquedas por organización y estado activo
    await queryInterface.addIndex('actividades', ['organizationId', 'active'], {
      name: 'idx_actividades_org_active',
      comment: 'Índice para búsquedas de actividades activas por organización',
    });

    // Índice para filtros por tipo de actividad
    await queryInterface.addIndex('actividades', ['type'], {
      name: 'idx_actividades_type',
      comment: 'Índice para filtros por tipo de actividad',
    });

    // Índice para filtros por tipo de agenda (crítico para validaciones)
    await queryInterface.addIndex('actividades', ['agendaType'], {
      name: 'idx_actividades_agenda_type',
      comment: 'Índice para filtros por tipo de agenda',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('actividades');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_actividades_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_actividades_agendaType";');
  },
};
