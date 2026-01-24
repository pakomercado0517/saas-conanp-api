'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bloques', {
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
        comment: 'Organización a la que pertenece el bloque',
      },
      actividadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'actividades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Actividad para la cual se define el bloque',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha específica del bloque (null si es plantilla)',
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Hora de inicio del bloque',
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Hora de fin del bloque',
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Capacidad máxima del bloque (número de personas)',
        validate: {
          min: 1,
        },
      },
      isTemplate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es una plantilla reutilizable (date será null)',
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
    await queryInterface.addIndex('bloques', ['organizationId'], {
      name: 'idx_bloques_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    // Índice para búsquedas por actividad
    await queryInterface.addIndex('bloques', ['actividadId'], {
      name: 'idx_bloques_actividad',
      comment: 'Índice para búsquedas por actividad',
    });

    // Índice compuesto para búsquedas por actividad y fecha
    await queryInterface.addIndex('bloques', ['actividadId', 'date'], {
      name: 'idx_bloques_actividad_date',
      comment: 'Índice para búsquedas de bloques por actividad y fecha',
    });

    // Índice para búsquedas por fecha
    await queryInterface.addIndex('bloques', ['date'], {
      name: 'idx_bloques_date',
      comment: 'Índice para búsquedas por fecha',
    });

    // Índice para filtros por plantilla
    await queryInterface.addIndex('bloques', ['isTemplate'], {
      name: 'idx_bloques_is_template',
      comment: 'Índice para filtros por plantilla',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bloques');
  },
};
