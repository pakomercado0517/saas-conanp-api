'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos_acceso', {
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
        comment: 'Organización a la que pertenece el producto (multi-tenant)',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del producto (ej. Brazalete 1 día, Pasaporte anual)',
      },
      tipo: {
        type: Sequelize.ENUM('brazalete', 'pasaporte'),
        allowNull: false,
        comment: 'Tipo de producto de acceso',
      },
      vigenciaDias: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Días de vigencia (1, 365, etc.)',
      },
      precioReferencia: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Precio de referencia informativo para reportes',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si el producto está activo',
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete',
      },
    });

    await queryInterface.addIndex('productos_acceso', ['organizationId'], {
      name: 'idx_productos_acceso_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    await queryInterface.addIndex('productos_acceso', ['tipo'], {
      name: 'idx_productos_acceso_tipo',
      comment: 'Índice para filtros por tipo (brazalete/pasaporte)',
    });

    await queryInterface.addIndex('productos_acceso', ['active'], {
      name: 'idx_productos_acceso_active',
      comment: 'Índice para filtrar productos activos',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos_acceso');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_productos_acceso_tipo";'
    );
  },
};
