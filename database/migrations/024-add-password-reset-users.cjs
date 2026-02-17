'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'users',
      'passwordResetToken',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token hasheado para recuperación de contraseña (1h de vigencia)',
      }
    );

    await queryInterface.addColumn(
      'users',
      'passwordResetExpiresAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del token de recuperación de contraseña',
      }
    );

    await queryInterface.addIndex('users', ['passwordResetToken'], {
      name: 'idx_users_password_reset_token',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'idx_users_password_reset_token');
    await queryInterface.removeColumn('users', 'passwordResetExpiresAt');
    await queryInterface.removeColumn('users', 'passwordResetToken');
  },
};
