import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import type { ProductoAccesoTipo } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';

export interface ProductoAccesoAttributes {
  id: UUID;
  organizationId: UUID;
  name: string;
  tipo: ProductoAccesoTipo;
  vigenciaDias: number;
  precioReferencia: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProductoAccesoCreationAttributes extends Optional<
  ProductoAccesoAttributes,
  'id' | 'precioReferencia' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}

export class ProductoAcceso
  extends Model<ProductoAccesoAttributes, ProductoAccesoCreationAttributes>
  implements ProductoAccesoAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare name: string;
  declare tipo: ProductoAccesoTipo;
  declare vigenciaDias: number;
  declare precioReferencia: string | null;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;

  declare Organization?: Organization;
}

ProductoAcceso.init(
  {
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
  },
  {
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
  }
);

ProductoAcceso.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
Organization.hasMany(ProductoAcceso, { foreignKey: 'organizationId', as: 'ProductosAcceso' });
