'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activos', {
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
        comment: 'Organización a la que pertenece el activo',
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prestador_profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Prestador propietario del activo',
      },
      type: {
        type: Sequelize.ENUM('embarcacion', 'vehiculo', 'guia', 'equipo'),
        allowNull: false,
        comment: 'Tipo de activo',
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido'),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado del activo en el flujo de aprobación',
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
    await queryInterface.addIndex('activos', ['organizationId'], {
      name: 'idx_activos_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    // Índice para búsquedas por propietario
    await queryInterface.addIndex('activos', ['ownerId'], {
      name: 'idx_activos_owner',
      comment: 'Índice para búsquedas por propietario',
    });

    // Índice compuesto para búsquedas por organización y propietario
    await queryInterface.addIndex('activos', ['organizationId', 'ownerId'], {
      name: 'idx_activos_org_owner',
      comment: 'Índice para búsquedas por organización y propietario',
    });

    // Índice para filtros por tipo
    await queryInterface.addIndex('activos', ['type'], {
      name: 'idx_activos_type',
      comment: 'Índice para filtros por tipo de activo',
    });

    // Índice para filtros por status (crítico para flujo de aprobación)
    await queryInterface.addIndex('activos', ['status'], {
      name: 'idx_activos_status',
      comment: 'Índice para filtros por estado',
    });

    // Índice compuesto para búsquedas de activos aprobados por organización
    await queryInterface.addIndex('activos', ['organizationId', 'status'], {
      name: 'idx_activos_org_status',
      comment: 'Índice para búsquedas de activos por organización y estado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activos_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activos_status";');
  },
};
