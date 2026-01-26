'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('actividades', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Soft delete: fecha de eliminación',
    });

    await queryInterface.addIndex('actividades', ['deletedAt'], {
      name: 'idx_actividades_deleted_at',
      comment: 'Índice para filtrar actividades no eliminadas',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('actividades', 'idx_actividades_deleted_at');
    await queryInterface.removeColumn('actividades', 'deletedAt');
  },
};
