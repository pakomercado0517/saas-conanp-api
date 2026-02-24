import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { ProductoAcceso } from '@/modules/productos-acceso/models/producto-acceso.model.js';

export interface StockAccesoAttributes {
  id: UUID;
  dependenciaId: UUID;
  productoAccesoId: UUID;
  cantidad: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAccesoCreationAttributes extends Optional<
  StockAccesoAttributes,
  'id' | 'cantidad' | 'createdAt' | 'updatedAt'
> {}

export class StockAcceso
  extends Model<StockAccesoAttributes, StockAccesoCreationAttributes>
  implements StockAccesoAttributes
{
  declare id: UUID;
  declare dependenciaId: UUID;
  declare productoAccesoId: UUID;
  declare cantidad: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Dependencia?: Dependencia;
  declare ProductoAcceso?: ProductoAcceso;
}

StockAcceso.init(
  {
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
  },
  {
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
  }
);

StockAcceso.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
StockAcceso.belongsTo(ProductoAcceso, { foreignKey: 'productoAccesoId', as: 'ProductoAcceso' });
Dependencia.hasMany(StockAcceso, { foreignKey: 'dependenciaId', as: 'StocksAcceso' });
ProductoAcceso.hasMany(StockAcceso, { foreignKey: 'productoAccesoId', as: 'StocksAcceso' });
