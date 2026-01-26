'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('eventos_operativos', {
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
        comment: 'Organización a la que pertenece el evento',
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
        comment: 'Prestador que realiza el evento',
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
        comment: 'Actividad que se realiza en el evento',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha del evento',
      },
      bloqueId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'bloques',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Bloque seleccionado (obligatorio si agendaType = BLOQUES)',
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Hora de inicio (obligatorio si agendaType = HORARIO_LIBRE)',
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Hora de fin (obligatorio si agendaType = HORARIO_LIBRE)',
      },
      peopleCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Número de personas en el evento',
        validate: {
          min: 1,
        },
      },
      status: {
        type: Sequelize.ENUM('programado', 'en_curso', 'completado', 'cancelado'),
        allowNull: false,
        defaultValue: 'programado',
        comment: 'Estado del evento',
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
    await queryInterface.addIndex('eventos_operativos', ['organizationId'], {
      name: 'idx_eventos_operativos_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    // Índice para búsquedas por prestador
    await queryInterface.addIndex('eventos_operativos', ['prestadorId'], {
      name: 'idx_eventos_operativos_prestador',
      comment: 'Índice para búsquedas por prestador',
    });

    // Índice para búsquedas por actividad
    await queryInterface.addIndex('eventos_operativos', ['actividadId'], {
      name: 'idx_eventos_operativos_actividad',
      comment: 'Índice para búsquedas por actividad',
    });

    // Índice compuesto para búsquedas por organización y fecha
    await queryInterface.addIndex('eventos_operativos', ['organizationId', 'date'], {
      name: 'idx_eventos_operativos_org_date',
      comment: 'Índice para búsquedas por organización y fecha',
    });

    // Índice para búsquedas por fecha
    await queryInterface.addIndex('eventos_operativos', ['date'], {
      name: 'idx_eventos_operativos_date',
      comment: 'Índice para búsquedas por fecha',
    });

    // Índice para búsquedas por bloque
    await queryInterface.addIndex('eventos_operativos', ['bloqueId'], {
      name: 'idx_eventos_operativos_bloque',
      comment: 'Índice para búsquedas por bloque',
    });

    // Índice para filtros por status
    await queryInterface.addIndex('eventos_operativos', ['status'], {
      name: 'idx_eventos_operativos_status',
      comment: 'Índice para filtros por estado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('eventos_operativos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_eventos_operativos_status";');
  },
};
