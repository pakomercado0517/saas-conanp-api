'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('capacidades', {
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
        comment: 'Organización a la que pertenece la capacidad',
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
        comment: 'Actividad para la cual se define la capacidad',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha para la cual se define la capacidad',
      },
      limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Límite de capacidad (número de personas o eventos según el tipo de agenda)',
        validate: {
          min: 1,
        },
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
    await queryInterface.addIndex('capacidades', ['organizationId'], {
      name: 'idx_capacidades_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    // Índice para búsquedas por actividad
    await queryInterface.addIndex('capacidades', ['actividadId'], {
      name: 'idx_capacidades_actividad',
      comment: 'Índice para búsquedas por actividad',
    });

    // Índice compuesto único: una actividad solo puede tener una capacidad por fecha
    await queryInterface.addIndex('capacidades', ['actividadId', 'date'], {
      name: 'idx_capacidades_actividad_date',
      unique: true,
      comment: 'Una actividad solo puede tener una capacidad por fecha',
    });

    // Índice para búsquedas por fecha
    await queryInterface.addIndex('capacidades', ['date'], {
      name: 'idx_capacidades_date',
      comment: 'Índice para búsquedas por fecha',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('capacidades');
  },
};
