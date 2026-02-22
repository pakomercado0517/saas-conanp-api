'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invitation_email_proofs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      invitationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'invitations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Invitación asociada',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email a verificar (debe coincidir con invitación)',
      },
      otpHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hash del OTP enviado por correo',
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Intentos de OTP fallidos',
      },
      maxAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Máximo de intentos antes de bloquear',
      },
      otpExpiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Expiración del OTP',
      },
      proofTokenHash: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Hash del proof token emitido tras OTP correcto',
      },
      proofExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del proof token para registro',
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Cuándo se usó el proof en registro (single-use)',
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

    await queryInterface.addIndex('invitation_email_proofs', ['invitationId', 'email'], {
      name: 'idx_invitation_email_proofs_invitation_email',
    });
    await queryInterface.addIndex('invitation_email_proofs', ['proofTokenHash'], {
      name: 'idx_invitation_email_proofs_proof_token',
    });
    await queryInterface.addIndex('invitation_email_proofs', ['otpExpiresAt'], {
      name: 'idx_invitation_email_proofs_otp_expires',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invitation_email_proofs');
  },
};
