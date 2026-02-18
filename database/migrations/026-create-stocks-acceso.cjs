'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stocks_acceso', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Organización (multi-tenant)',
      },
      productoAccesoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'productos_acceso',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Producto de acceso al que corresponde el stock',
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad en stock (no negativo)',
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

    await queryInterface.addIndex('stocks_acceso', ['organizationId'], {
      name: 'idx_stocks_acceso_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    await queryInterface.addIndex('stocks_acceso', ['productoAccesoId'], {
      name: 'idx_stocks_acceso_producto',
      comment: 'Índice para búsquedas por producto',
    });

    await queryInterface.addIndex(
      'stocks_acceso',
      ['organizationId', 'productoAccesoId'],
      {
        name: 'uq_stocks_acceso_org_producto',
        unique: true,
        comment: 'Una sola fila de stock por organización y producto',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stocks_acceso');
  },
};
