'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Email único del usuario',
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Password hasheado con bcrypt',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre completo del usuario',
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

    // Índice único para email (ya está definido como unique, pero lo agregamos explícitamente)
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email_unique',
      unique: true,
      comment: 'Índice único para email',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
