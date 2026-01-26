'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evidencias_ambientales', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      eventoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'eventos_operativos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Evento operativo al que pertenece la evidencia',
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tipo de evidencia (ej: "foto", "video", "reporte", "observacion")',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la evidencia',
      },
      fileUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del archivo de la evidencia',
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

    // Índice para búsquedas por evento
    await queryInterface.addIndex('evidencias_ambientales', ['eventoId'], {
      name: 'idx_evidencias_ambientales_evento',
      comment: 'Índice para búsquedas por evento',
    });

    // Índice para filtros por tipo
    await queryInterface.addIndex('evidencias_ambientales', ['type'], {
      name: 'idx_evidencias_ambientales_type',
      comment: 'Índice para filtros por tipo de evidencia',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evidencias_ambientales');
  },
};
