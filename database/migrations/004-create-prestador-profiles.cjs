'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prestador_profiles', {
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
        comment: 'Usuario que es prestador',
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
        comment: 'Organización donde el usuario es prestador',
      },
      status: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
        comment: 'Estado del perfil de prestador',
      },
      permitExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del permiso general del prestador (opcional)',
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

    // Índice compuesto único: un usuario solo puede tener un perfil de prestador por organización
    await queryInterface.addIndex('prestador_profiles', ['userId', 'organizationId'], {
      name: 'idx_prestador_profiles_user_org',
      unique: true,
      comment: 'Un usuario solo puede tener un perfil de prestador por organización',
    });

    // Índice para búsquedas por organización
    await queryInterface.addIndex('prestador_profiles', ['organizationId'], {
      name: 'idx_prestador_profiles_organization',
      comment: 'Índice para búsquedas por organización',
    });

    // Índice para búsquedas por usuario
    await queryInterface.addIndex('prestador_profiles', ['userId'], {
      name: 'idx_prestador_profiles_user',
      comment: 'Índice para búsquedas por usuario',
    });

    // Índice para filtros por status
    await queryInterface.addIndex('prestador_profiles', ['status'], {
      name: 'idx_prestador_profiles_status',
      comment: 'Índice para filtros por estado',
    });

    // Índice para búsquedas por fecha de expiración de permiso
    await queryInterface.addIndex('prestador_profiles', ['permitExpiresAt'], {
      name: 'idx_prestador_profiles_permit_expires',
      comment: 'Índice para búsquedas por fecha de expiración de permiso',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('prestador_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_prestador_profiles_status";');
  },
};
