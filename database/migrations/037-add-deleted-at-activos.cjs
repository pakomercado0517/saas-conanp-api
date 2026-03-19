'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activos', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete: fecha de eliminación',
    });

    await queryInterface.addIndex('activos', ['deletedAt'], {
      name: 'idx_activos_deleted_at',
      comment: 'Índice para filtrar activos no eliminados',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('activos', 'idx_activos_deleted_at');
    await queryInterface.removeColumn('activos', 'deletedAt');
  },
};
