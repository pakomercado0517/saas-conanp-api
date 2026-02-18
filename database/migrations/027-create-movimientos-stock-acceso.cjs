'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_stock_acceso', {
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
        comment: 'Producto de acceso del movimiento',
      },
      tipo: {
        type: Sequelize.ENUM('entrada', 'salida'),
        allowNull: false,
        comment: 'Tipo de movimiento',
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad (positivo)',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha del movimiento',
      },
      motivo: {
        type: Sequelize.ENUM('compra', 'venta', 'ajuste', 'devolucion'),
        allowNull: false,
        comment: 'Motivo del movimiento',
      },
      referencia: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Folio, número externo, etc.',
      },
      montoUnitario: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Monto unitario (para salidas de venta, informativo)',
      },
      montoTotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Monto total (informativo)',
      },
      prestadorId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'prestador_profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Prestador asociado (trazabilidad)',
      },
      eventoId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'eventos_operativos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Evento asociado (trazabilidad)',
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que registró el movimiento',
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales',
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

    await queryInterface.addIndex('movimientos_stock_acceso', ['organizationId'], {
      name: 'idx_movimientos_stock_acceso_organization',
      comment: 'Índice para búsquedas por organización (multi-tenant)',
    });

    await queryInterface.addIndex('movimientos_stock_acceso', ['productoAccesoId'], {
      name: 'idx_movimientos_stock_acceso_producto',
      comment: 'Índice para búsquedas por producto',
    });

    await queryInterface.addIndex('movimientos_stock_acceso', ['fecha'], {
      name: 'idx_movimientos_stock_acceso_fecha',
      comment: 'Índice para reportes por fecha',
    });

    await queryInterface.addIndex('movimientos_stock_acceso', ['tipo'], {
      name: 'idx_movimientos_stock_acceso_tipo',
      comment: 'Índice para filtrar entradas/salidas',
    });

    await queryInterface.addIndex('movimientos_stock_acceso', ['prestadorId'], {
      name: 'idx_movimientos_stock_acceso_prestador',
      comment: 'Índice para trazabilidad por prestador',
    });

    await queryInterface.addIndex('movimientos_stock_acceso', ['eventoId'], {
      name: 'idx_movimientos_stock_acceso_evento',
      comment: 'Índice para trazabilidad por evento',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos_stock_acceso');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_movimientos_stock_acceso_tipo";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_movimientos_stock_acceso_motivo";'
    );
  },
};
