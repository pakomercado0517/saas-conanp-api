'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('memberships', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario que pertenece a la organización',
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
        comment: 'Organización a la que pertenece el usuario',
      },
      role: {
        type: Sequelize.ENUM('admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
        comment: 'Rol del usuario en la organización',
      },
      status: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
        comment: 'Estado de la membresía',
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

    // Índice compuesto para búsquedas por usuario y organización
    await queryInterface.addIndex('memberships', ['userId', 'organizationId'], {
      name: 'idx_memberships_user_org',
      unique: true,
      comment: 'Un usuario solo puede tener una membresía por organización',
    });

    // Índice para búsquedas por organización
    await queryInterface.addIndex('memberships', ['organizationId'], {
      name: 'idx_memberships_organization',
      comment: 'Índice para búsquedas por organización',
    });

    // Índice para búsquedas por usuario
    await queryInterface.addIndex('memberships', ['userId'], {
      name: 'idx_memberships_user',
      comment: 'Índice para búsquedas por usuario',
    });

    // Índice para filtros por rol
    await queryInterface.addIndex('memberships', ['role'], {
      name: 'idx_memberships_role',
      comment: 'Índice para filtros por rol',
    });

    // Índice para filtros por status
    await queryInterface.addIndex('memberships', ['status'], {
      name: 'idx_memberships_status',
      comment: 'Índice para filtros por estado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('memberships');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_memberships_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_memberships_status";');
  },
};
