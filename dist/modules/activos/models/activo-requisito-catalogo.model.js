import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
export class ActivoRequisitoCatalogo extends Model {
}
ActivoRequisitoCatalogo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    dependenciaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'dependencias',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    tipoActivo: {
        type: DataTypes.ENUM('embarcacion', 'vehiculo', 'guia', 'equipo'),
        allowNull: false,
    },
    key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La clave es requerida' },
            len: { args: [1, 255], msg: 'La clave debe tener entre 1 y 255 caracteres' },
        },
    },
    label: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    tipoDato: {
        type: DataTypes.ENUM('string', 'date', 'number'),
        allowNull: false,
    },
    requerido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    requiereDocumento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'ActivoRequisitoCatalogo',
    tableName: 'activo_requisito_catalogo',
    timestamps: true,
    underscored: false,
    indexes: [
        { name: 'idx_activo_requisito_catalogo_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_activo_requisito_catalogo_dep_tipo', fields: ['dependenciaId', 'tipoActivo'] },
        {
            name: 'idx_activo_requisito_catalogo_uniq',
            unique: true,
            fields: ['dependenciaId', 'tipoActivo', 'key'],
        },
    ],
});
ActivoRequisitoCatalogo.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
Dependencia.hasMany(ActivoRequisitoCatalogo, {
    foreignKey: 'dependenciaId',
    as: 'ActivoRequisitoCatalogo',
});
//# sourceMappingURL=activo-requisito-catalogo.model.js.map