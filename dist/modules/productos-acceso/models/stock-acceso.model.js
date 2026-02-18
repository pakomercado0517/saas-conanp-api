import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model';
export class StockAcceso extends Model {
}
StockAcceso.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'id',
        },
        validate: {
            notEmpty: { msg: 'El ID de organización es requerido' },
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
        { name: 'idx_stocks_acceso_organization', fields: ['organizationId'] },
        { name: 'idx_stocks_acceso_producto', fields: ['productoAccesoId'] },
        {
            name: 'uq_stocks_acceso_org_producto',
            unique: true,
            fields: ['organizationId', 'productoAccesoId'],
        },
    ],
});
StockAcceso.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
StockAcceso.belongsTo(ProductoAcceso, { foreignKey: 'productoAccesoId', as: 'ProductoAcceso' });
Organization.hasMany(StockAcceso, { foreignKey: 'organizationId', as: 'StocksAcceso' });
ProductoAcceso.hasMany(StockAcceso, { foreignKey: 'productoAccesoId', as: 'StocksAcceso' });
//# sourceMappingURL=stock-acceso.model.js.map