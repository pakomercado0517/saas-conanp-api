'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('eventos_operativos', 'createdByUserId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Usuario que creó el evento (auditoría)',
    });

    await queryInterface.addColumn('eventos_operativos', 'updatedByUserId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Usuario que actualizó el evento por última vez (auditoría)',
    });

    await queryInterface.addColumn('eventos_operativos', 'capacityOverride', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'True si un administrador reservó por encima del cupo disponible',
    });

    await queryInterface.addColumn('eventos_operativos', 'capacityOverrideReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Motivo del override de capacidad (obligatorio cuando capacityOverride es true)',
    });

    await queryInterface.addIndex('eventos_operativos', ['createdByUserId'], {
      name: 'idx_eventos_operativos_created_by_user',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('eventos_operativos', 'idx_eventos_operativos_created_by_user');
    await queryInterface.removeColumn('eventos_operativos', 'capacityOverrideReason');
    await queryInterface.removeColumn('eventos_operativos', 'capacityOverride');
    await queryInterface.removeColumn('eventos_operativos', 'updatedByUserId');
    await queryInterface.removeColumn('eventos_operativos', 'createdByUserId');
  },
};
