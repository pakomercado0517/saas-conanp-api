'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activo_requisito_catalogo', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      dependenciaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'dependencias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Dependencia a la que aplica este requisito',
      },
      tipoActivo: {
        type: Sequelize.ENUM('embarcacion', 'vehiculo', 'guia', 'equipo'),
        allowNull: false,
        comment: 'Tipo de activo al que aplica',
      },
      key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Clave única del requisito (ej: nombre, matricula, vencimiento)',
      },
      label: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Etiqueta para mostrar en la UI',
      },
      tipoDato: {
        type: Sequelize.ENUM('string', 'date', 'number'),
        allowNull: false,
        comment: 'Tipo de dato del valor',
      },
      requerido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el requisito es obligatorio',
      },
      requiereDocumento: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si debe adjuntarse documento',
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden de aparición en formularios',
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la definición está habilitada',
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

    await queryInterface.addIndex('activo_requisito_catalogo', ['dependenciaId'], {
      name: 'idx_activo_requisito_catalogo_dependencia',
      comment: 'Búsquedas por dependencia',
    });

    await queryInterface.addIndex('activo_requisito_catalogo', ['dependenciaId', 'tipoActivo'], {
      name: 'idx_activo_requisito_catalogo_dep_tipo',
      comment: 'Búsquedas por dependencia y tipo de activo',
    });

    await queryInterface.addIndex(
      'activo_requisito_catalogo',
      ['dependenciaId', 'tipoActivo', 'key'],
      {
        name: 'idx_activo_requisito_catalogo_uniq',
        unique: true,
        comment: 'Una key por tipo de activo y dependencia',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activo_requisito_catalogo');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activo_requisito_catalogo_tipoactivo";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activo_requisito_catalogo_tipodato";');
  },
};
