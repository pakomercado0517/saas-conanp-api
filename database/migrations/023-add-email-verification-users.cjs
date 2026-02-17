'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'users',
      'emailVerified',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el correo electrónico ha sido verificado',
      }
    );

    await queryInterface.addColumn(
      'users',
      'emailVerificationToken',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token hasheado para verificación de email (24h de vigencia)',
      }
    );

    await queryInterface.addColumn(
      'users',
      'emailVerificationExpiresAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del token de verificación',
      }
    );

    await queryInterface.addIndex('users', ['emailVerificationToken'], {
      name: 'idx_users_email_verification_token',
    });

    // Marcar usuarios existentes como ya verificados (no tenían flujo de verificación)
    await queryInterface.sequelize.query(
      'UPDATE users SET "emailVerified" = true WHERE "emailVerificationToken" IS NULL;'
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'idx_users_email_verification_token');
    await queryInterface.removeColumn('users', 'emailVerificationExpiresAt');
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'emailVerified');
  },
};
