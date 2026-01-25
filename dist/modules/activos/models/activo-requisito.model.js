import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Activo } from './activo.model';
export class ActivoRequisito extends Model {
}
ActivoRequisito.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    activoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'activos',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de activo es requerido',
            },
        },
    },
    key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La clave del requisito es requerida',
            },
            len: {
                args: [1, 255],
                msg: 'La clave debe tener entre 1 y 255 caracteres',
            },
        },
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    documentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isURL: {
                protocols: ['http', 'https'],
                require_protocol: true,
            },
        },
    },
    validated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    modelName: 'ActivoRequisito',
    tableName: 'activo_requisitos',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_activo_requisitos_activo',
            fields: ['activoId'],
        },
        {
            name: 'idx_activo_requisitos_activo_key',
            unique: true,
            fields: ['activoId', 'key'],
        },
        {
            name: 'idx_activo_requisitos_validated',
            fields: ['validated'],
        },
    ],
});
// Definir relaciones
ActivoRequisito.belongsTo(Activo, { foreignKey: 'activoId', as: 'Activo' });
Activo.hasMany(ActivoRequisito, { foreignKey: 'activoId', as: 'Requisitos' });
//# sourceMappingURL=activo-requisito.model.js.map