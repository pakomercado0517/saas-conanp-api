import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model.js';
export class StockAcceso extends Model {
}
StockAcceso.init({
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
        validate: {
            notEmpty: { msg: 'El ID de dependencia es requerido' },
        },
    },
    productoAccesoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'productos_acceso',
            key: 'id',
        },
        validate: {
            notEmpty: { msg: 'El ID de producto es requerido' },
        },
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: { args: [0], msg: 'La cantidad no puede ser negativa' },
            isInt: { msg: 'La cantidad debe ser un número entero' },
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
}, {
    sequelize,
    modelName: 'StockAcceso',
    tableName: 'stocks_acceso',
    timestamps: true,
    paranoid: false,
    underscored: false,
    indexes: [
        { name: 'idx_stocks_acceso_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_stocks_acceso_producto', fields: ['productoAccesoId'] },
        {
            name: 'uq_stocks_acceso_dep_producto',
            unique: true,
            fields: ['dependenciaId', 'productoAccesoId'],
        },
    ],
});
StockAcceso.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
StockAcceso.belongsTo(ProductoAcceso, { foreignKey: 'productoAccesoId', as: 'ProductoAcceso' });
Dependencia.hasMany(StockAcceso, { foreignKey: 'dependenciaId', as: 'StocksAcceso' });
ProductoAcceso.hasMany(StockAcceso, { foreignKey: 'productoAccesoId', as: 'StocksAcceso' });
//# sourceMappingURL=stock-acceso.model.js.map