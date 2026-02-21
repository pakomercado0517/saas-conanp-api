'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invitations', {
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
        comment: 'Organización a la que se invita',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email del invitado (debe coincidir con el registro)',
      },
      role: {
        type: Sequelize.ENUM('admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
        comment: 'Rol asignado al aceptar la invitación',
      },
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hash del token one-time para aceptar invitación',
      },
      invitedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario admin que envió la invitación',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la invitación',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del token',
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que se usó la invitación (registro aceptado)',
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que un admin revocó la invitación',
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

    await queryInterface.addIndex('invitations', ['tokenHash'], {
      name: 'idx_invitations_token_hash',
      unique: true,
    });

    await queryInterface.addIndex('invitations', ['organizationId', 'email', 'status'], {
      name: 'idx_invitations_org_email_status',
    });

    await queryInterface.addIndex('invitations', ['expiresAt'], {
      name: 'idx_invitations_expires_at',
    });

    await queryInterface.addIndex('invitations', ['organizationId'], {
      name: 'idx_invitations_organization',
    });

    await queryInterface.addIndex('invitations', ['email'], {
      name: 'idx_invitations_email',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invitations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_invitations_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_invitations_status";');
  },
};
