'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('permisos', 'appliesToAllAreas', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Si el permiso fue creado aplicando a todas las áreas de la dependencia (materializado)',
    });
    await queryInterface.addColumn('permisos', 'permissionGroupId', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'Agrupa filas creadas en el mismo lote (mismo expediente lógico)',
    });
    await queryInterface.addIndex('permisos', ['permissionGroupId'], {
      name: 'idx_permisos_permission_group',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('permisos', 'idx_permisos_permission_group');
    await queryInterface.removeColumn('permisos', 'permissionGroupId');
    await queryInterface.removeColumn('permisos', 'appliesToAllAreas');
  },
};
