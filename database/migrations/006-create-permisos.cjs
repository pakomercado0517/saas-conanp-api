'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permisos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      prestadorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prestador_profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Prestador que tiene el permiso',
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
        comment: 'Actividad para la cual se otorga el permiso',
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha desde la cual el permiso es válido',
      },
      validTo: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha hasta la cual el permiso es válido',
      },
      status: {
        type: Sequelize.ENUM('activo', 'inactivo', 'vencido', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
        comment: 'Estado del permiso',
      },
      documentUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del documento del permiso',
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

    // Índice compuesto único: un prestador solo puede tener un permiso activo por actividad
    await queryInterface.addIndex('permisos', ['prestadorId', 'actividadId'], {
      name: 'idx_permisos_prestador_actividad',
      comment: 'Índice para búsquedas por prestador y actividad',
    });

    // Índice para búsquedas por prestador
    await queryInterface.addIndex('permisos', ['prestadorId'], {
      name: 'idx_permisos_prestador',
      comment: 'Índice para búsquedas por prestador',
    });

    // Índice para búsquedas por actividad
    await queryInterface.addIndex('permisos', ['actividadId'], {
      name: 'idx_permisos_actividad',
      comment: 'Índice para búsquedas por actividad',
    });

    // Índice compuesto para búsquedas de permisos vigentes por fecha
    await queryInterface.addIndex('permisos', ['validFrom', 'validTo'], {
      name: 'idx_permisos_valid_dates',
      comment: 'Índice para búsquedas de permisos por rango de fechas',
    });

    // Índice para filtros por status
    await queryInterface.addIndex('permisos', ['status'], {
      name: 'idx_permisos_status',
      comment: 'Índice para filtros por estado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permisos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_permisos_status";');
  },
};
