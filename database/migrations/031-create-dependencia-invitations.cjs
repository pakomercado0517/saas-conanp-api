'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dependencia_invitations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      dependenciaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'dependencias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
      },
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      invitedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'pending',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('dependencia_invitations', ['tokenHash'], {
      name: 'idx_dependencia_invitations_token_hash',
      unique: true,
    });
    await queryInterface.addIndex('dependencia_invitations', ['dependenciaId', 'email', 'status'], {
      name: 'idx_dep_invitations_dep_email_status',
    });
    await queryInterface.addIndex('dependencia_invitations', ['expiresAt'], {
      name: 'idx_dep_invitations_expires_at',
    });
    await queryInterface.addIndex('dependencia_invitations', ['dependenciaId'], {
      name: 'idx_dep_invitations_dependencia',
    });
    await queryInterface.addIndex('dependencia_invitations', ['email'], {
      name: 'idx_dep_invitations_email',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dependencia_invitations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dependencia_invitations_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dependencia_invitations_status";');
  },
};
