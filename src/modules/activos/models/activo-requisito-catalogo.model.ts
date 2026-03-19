import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, ActivoType } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';

export type CatalogoTipoDato = 'string' | 'date' | 'number';

export interface ActivoRequisitoCatalogoAttributes {
  id: UUID;
  dependenciaId: UUID;
  tipoActivo: ActivoType;
  key: string;
  label: string | null;
  tipoDato: CatalogoTipoDato;
  requerido: boolean;
  requiereDocumento: boolean;
  orden: number | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivoRequisitoCatalogoCreationAttributes extends Optional<
  ActivoRequisitoCatalogoAttributes,
  | 'id'
  | 'label'
  | 'requerido'
  | 'requiereDocumento'
  | 'orden'
  | 'activo'
  | 'createdAt'
  | 'updatedAt'
> {}

export class ActivoRequisitoCatalogo
  extends Model<ActivoRequisitoCatalogoAttributes, ActivoRequisitoCatalogoCreationAttributes>
  implements ActivoRequisitoCatalogoAttributes
{
  declare id: UUID;
  declare dependenciaId: UUID;
  declare tipoActivo: ActivoType;
  declare key: string;
  declare label: string | null;
  declare tipoDato: CatalogoTipoDato;
  declare requerido: boolean;
  declare requiereDocumento: boolean;
  declare orden: number | null;
  declare activo: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Dependencia?: Dependencia;
}

ActivoRequisitoCatalogo.init(
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
  },
  {
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
  }
);

ActivoRequisitoCatalogo.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
Dependencia.hasMany(ActivoRequisitoCatalogo, {
  foreignKey: 'dependenciaId',
  as: 'ActivoRequisitoCatalogo',
});
