import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Organization } from '../../../modules/organizations/models/organization.model';
export class ProductoAcceso extends Model {
}
ProductoAcceso.init({
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
            notEmpty: {
                msg: 'El ID de organización es requerido',
            },
        },
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del producto es requerido' },
            len: { args: [1, 255], msg: 'El nombre debe tener entre 1 y 255 caracteres' },
        },
    },
    tipo: {
        type: DataTypes.ENUM('brazalete', 'pasaporte'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['brazalete', 'pasaporte']],
                msg: 'El tipo debe ser brazalete o pasaporte',
            },
        },
    },
    vigenciaDias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: 'La vigencia debe ser al menos 1 día' },
            isInt: { msg: 'La vigencia debe ser un número entero' },
        },
    },
    precioReferencia: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            isDecimal: { msg: 'El precio de referencia debe ser un número válido' },
        },
    },
    active: {
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
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'ProductoAcceso',
    tableName: 'productos_acceso',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        { name: 'idx_productos_acceso_organization', fields: ['organizationId'] },
        { name: 'idx_productos_acceso_tipo', fields: ['tipo'] },
        { name: 'idx_productos_acceso_active', fields: ['active'] },
    ],
});
ProductoAcceso.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Organization.hasMany(ProductoAcceso, { foreignKey: 'organizationId', as: 'ProductosAcceso' });
//# sourceMappingURL=producto-acceso.model.js.map