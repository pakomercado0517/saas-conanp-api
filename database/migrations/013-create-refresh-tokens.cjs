'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Usuario propietario del token',
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        comment: 'Token de refresh hasheado con bcrypt',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del token',
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Fecha de revocación del token (null si está activo)',
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

    // Índice para búsquedas por usuario
    await queryInterface.addIndex('refresh_tokens', ['userId'], {
      name: 'idx_refresh_tokens_user_id',
      comment: 'Índice para búsquedas por usuario',
    });

    // Índice único para token (ya está definido como unique, pero lo agregamos explícitamente)
    await queryInterface.addIndex('refresh_tokens', ['token'], {
      name: 'idx_refresh_tokens_token_unique',
      unique: true,
      comment: 'Índice único para token',
    });

    // Índice para limpiar tokens expirados
    await queryInterface.addIndex('refresh_tokens', ['expiresAt'], {
      name: 'idx_refresh_tokens_expires_at',
      comment: 'Índice para limpiar tokens expirados',
    });

    // Índice compuesto para búsquedas eficientes por usuario y expiración
    await queryInterface.addIndex('refresh_tokens', ['userId', 'expiresAt'], {
      name: 'idx_refresh_tokens_user_expires',
      comment: 'Índice compuesto para búsquedas por usuario y expiración',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
