import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model.js';
import { User } from '../../../modules/users/models/user.model.js';
export class MovimientoStockAcceso extends Model {
}
MovimientoStockAcceso.init({
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
    tipo: {
        type: DataTypes.ENUM('entrada', 'salida'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['entrada', 'salida']],
                msg: 'El tipo debe ser entrada o salida',
            },
        },
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: 'La cantidad debe ser positiva' },
            isInt: { msg: 'La cantidad debe ser un número entero' },
        },
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    motivo: {
        type: DataTypes.ENUM('compra', 'venta', 'ajuste', 'devolucion'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['compra', 'venta', 'ajuste', 'devolucion']],
                msg: 'El motivo debe ser: compra, venta, ajuste o devolucion',
            },
        },
    },
    referencia: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    montoUnitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    montoTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    prestadorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'prestador_profiles',
            key: 'id',
        },
    },
    eventoId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'eventos_operativos',
            key: 'id',
        },
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        validate: {
            notEmpty: { msg: 'El usuario que registra es requerido' },
        },
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    modelName: 'MovimientoStockAcceso',
    tableName: 'movimientos_stock_acceso',
    timestamps: true,
    paranoid: false,
    underscored: false,
    indexes: [
        { name: 'idx_movimientos_stock_acceso_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_movimientos_stock_acceso_producto', fields: ['productoAccesoId'] },
        { name: 'idx_movimientos_stock_acceso_fecha', fields: ['fecha'] },
        { name: 'idx_movimientos_stock_acceso_tipo', fields: ['tipo'] },
        { name: 'idx_movimientos_stock_acceso_prestador', fields: ['prestadorId'] },
        { name: 'idx_movimientos_stock_acceso_evento', fields: ['eventoId'] },
    ],
});
MovimientoStockAcceso.belongsTo(Dependencia, {
    foreignKey: 'dependenciaId',
    as: 'Dependencia',
});
MovimientoStockAcceso.belongsTo(ProductoAcceso, {
    foreignKey: 'productoAccesoId',
    as: 'ProductoAcceso',
});
MovimientoStockAcceso.belongsTo(PrestadorProfile, {
    foreignKey: 'prestadorId',
    as: 'PrestadorProfile',
});
MovimientoStockAcceso.belongsTo(EventoOperativo, {
    foreignKey: 'eventoId',
    as: 'EventoOperativo',
});
MovimientoStockAcceso.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'CreatedByUser',
});
Dependencia.hasMany(MovimientoStockAcceso, {
    foreignKey: 'dependenciaId',
    as: 'MovimientosStockAcceso',
});
ProductoAcceso.hasMany(MovimientoStockAcceso, {
    foreignKey: 'productoAccesoId',
    as: 'MovimientosStockAcceso',
});
PrestadorProfile.hasMany(MovimientoStockAcceso, {
    foreignKey: 'prestadorId',
    as: 'MovimientosStockAcceso',
});
EventoOperativo.hasMany(MovimientoStockAcceso, {
    foreignKey: 'eventoId',
    as: 'MovimientosStockAcceso',
});
User.hasMany(MovimientoStockAcceso, {
    foreignKey: 'createdBy',
    as: 'MovimientosStockAcceso',
});
//# sourceMappingURL=movimiento-stock-acceso.model.js.map