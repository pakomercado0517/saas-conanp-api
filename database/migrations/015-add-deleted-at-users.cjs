'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete: fecha de eliminación',
    });

    await queryInterface.addIndex('users', ['deletedAt'], {
      name: 'idx_users_deleted_at',
      comment: 'Índice para filtrar usuarios no eliminados',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'idx_users_deleted_at');
    await queryInterface.removeColumn('users', 'deletedAt');
  },
};
