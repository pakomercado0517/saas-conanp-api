'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activo_requisitos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      activoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'activos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Activo al que pertenece el requisito',
      },
      key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Clave/nombre del requisito (ej: "matricula", "seguro", "licencia")',
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Valor del requisito',
      },
      documentUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del documento que acredita el requisito',
      },
      validated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el requisito ha sido validado',
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

    // Índice para búsquedas por activo
    await queryInterface.addIndex('activo_requisitos', ['activoId'], {
      name: 'idx_activo_requisitos_activo',
      comment: 'Índice para búsquedas por activo',
    });

    // Índice compuesto para búsquedas por activo y clave
    await queryInterface.addIndex('activo_requisitos', ['activoId', 'key'], {
      name: 'idx_activo_requisitos_activo_key',
      unique: true,
      comment: 'Un activo no puede tener requisitos duplicados con la misma clave',
    });

    // Índice para filtros por estado de validación
    await queryInterface.addIndex('activo_requisitos', ['validated'], {
      name: 'idx_activo_requisitos_validated',
      comment: 'Índice para filtros por estado de validación',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activo_requisitos');
  },
};
