import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database';
export class Dependencia extends Model {
}
Dependencia.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre de la dependencia es requerido' },
            len: { args: [1, 255], msg: 'El nombre debe tener entre 1 y 255 caracteres' },
        },
    },
    settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        validate: {
            isObject(value) {
                if (value !== null && typeof value !== 'object') {
                    throw new Error('Settings debe ser un objeto');
                }
            },
        },
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
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Dependencia',
    tableName: 'dependencias',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [{ name: 'idx_dependencias_name', fields: ['name'] }],
});
//# sourceMappingURL=dependencia.model.js.map