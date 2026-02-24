import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, EcosystemType, SubscriptionStatus } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';

export interface AreaAttributes {
  id: UUID;
  dependenciaId: UUID;
  name: string;
  ecosystem_type: EcosystemType;
  settings: Record<string, unknown>;
  /** Derivado de la suscripción activa de la dependencia (cuando se incluye Subscription) */
  subscriptionStatus?: SubscriptionStatus;
  /** Derivado de la suscripción activa - currentPeriodEnd (cuando se incluye Subscription) */
  subscriptionExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AreaCreationAttributes extends Optional<
  AreaAttributes,
  'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}

export class Area extends Model<AreaAttributes, AreaCreationAttributes> implements AreaAttributes {
  declare id: UUID;
  declare dependenciaId: UUID;
  declare name: string;
  declare ecosystem_type: EcosystemType;
  declare settings: Record<string, unknown>;
  declare subscriptionStatus?: SubscriptionStatus;
  declare subscriptionExpiresAt?: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;

  declare Dependencia?: Dependencia;
}

Area.init(
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
      references: { model: 'dependencias', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre del área es requerido' },
        len: { args: [1, 255], msg: 'El nombre debe tener entre 1 y 255 caracteres' },
      },
    },
    ecosystem_type: {
      type: DataTypes.ENUM('terrestre', 'maritimo', 'mixto'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['terrestre', 'maritimo', 'mixto']],
          msg: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
        },
      },
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isObject(value: unknown): void {
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
    subscriptionStatus: {
      type: DataTypes.VIRTUAL,
      get(): SubscriptionStatus | undefined {
        const dep = this.get('Dependencia') as
          | { Subscription?: { status: SubscriptionStatus } }
          | undefined;
        return dep?.Subscription?.status;
      },
    },
    subscriptionExpiresAt: {
      type: DataTypes.VIRTUAL,
      get(): Date | null | undefined {
        const dep = this.get('Dependencia') as
          | { Subscription?: { currentPeriodEnd: Date } }
          | undefined;
        return dep?.Subscription?.currentPeriodEnd ?? null;
      },
    },
  },
  {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
      { name: 'idx_areas_dependencia', fields: ['dependenciaId'] },
      { name: 'idx_areas_name', fields: ['name'] },
      { name: 'idx_areas_ecosystem_type', fields: ['ecosystem_type'] },
    ],
  }
);

Area.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
Dependencia.hasMany(Area, { foreignKey: 'dependenciaId', as: 'Areas' });
