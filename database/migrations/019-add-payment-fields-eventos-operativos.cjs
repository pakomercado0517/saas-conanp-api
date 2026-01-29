'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('eventos_operativos', 'paymentRequired', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Si el evento requiere pago antes de confirmarse',
    });

    await queryInterface.addColumn('eventos_operativos', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha en que se completó el pago (actualizado desde flujo de pagos)',
    });

    await queryInterface.addIndex('eventos_operativos', ['paymentRequired'], {
      name: 'idx_eventos_operativos_payment_required',
      comment: 'Índice para filtrar eventos por pago requerido',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('eventos_operativos', 'idx_eventos_operativos_payment_required');
    await queryInterface.removeColumn('eventos_operativos', 'paidAt');
    await queryInterface.removeColumn('eventos_operativos', 'paymentRequired');
  },
};
