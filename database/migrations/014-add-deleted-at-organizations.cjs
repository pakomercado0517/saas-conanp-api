'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('organizations', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete: fecha de eliminación',
    });

    await queryInterface.addIndex('organizations', ['deletedAt'], {
      name: 'idx_organizations_deleted_at',
      comment: 'Índice para filtrar organizaciones no eliminadas',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('organizations', 'idx_organizations_deleted_at');
    await queryInterface.removeColumn('organizations', 'deletedAt');
  },
};
