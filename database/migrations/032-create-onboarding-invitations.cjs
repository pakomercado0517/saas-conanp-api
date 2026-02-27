'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('onboarding_invitations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex('onboarding_invitations', ['tokenHash'], {
      name: 'idx_onboarding_invitations_token_hash',
      unique: true,
    });
    await queryInterface.addIndex('onboarding_invitations', ['email', 'status'], {
      name: 'idx_onboarding_invitations_email_status',
    });
    await queryInterface.addIndex('onboarding_invitations', ['expiresAt'], {
      name: 'idx_onboarding_invitations_expires_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('onboarding_invitations');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS \"enum_onboarding_invitations_status\";'
    );
  },
};

