import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, SubscriptionPlanName } from '@/shared/database/types';

export interface SubscriptionPlanFeatures {
  limits?: Record<string, number>;
  functionalities?: string[];
  [key: string]: unknown;
}

export interface SubscriptionPlanAttributes {
  id: UUID;
  name: SubscriptionPlanName | string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  stripeProductId: string | null;
  features: SubscriptionPlanFeatures | null;
  maxOrganizations: number | null;
  maxUsers: number | null;
  maxEventos: number | null;
  maxActividades: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SubscriptionPlanCreationAttributes extends Optional<
  SubscriptionPlanAttributes,
  | 'id'
  | 'description'
  | 'stripePriceIdMonthly'
  | 'stripePriceIdYearly'
  | 'stripeProductId'
  | 'features'
  | 'maxOrganizations'
  | 'maxUsers'
  | 'maxEventos'
  | 'maxActividades'
  | 'active'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

export const SUBSCRIPTION_PLAN_NAMES: SubscriptionPlanName[] = [
  'free',
  'básico',
  'profesional',
  'empresarial',
];

export class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
  implements SubscriptionPlanAttributes
{
  declare id: UUID;
  declare name: SubscriptionPlanName | string;
  declare description: string | null;
  declare priceMonthly: number;
  declare priceYearly: number;
  declare stripePriceIdMonthly: string | null;
  declare stripePriceIdYearly: string | null;
  declare stripeProductId: string | null;
  declare features: SubscriptionPlanFeatures | null;
  declare maxOrganizations: number | null;
  declare maxUsers: number | null;
  declare maxEventos: number | null;
  declare maxActividades: number | null;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;
}

SubscriptionPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del plan es requerido',
        },
        len: {
          args: [1, 50],
          msg: 'El nombre debe tener entre 1 y 50 caracteres',
        },
        isIn: {
          args: [SUBSCRIPTION_PLAN_NAMES],
          msg: 'El nombre del plan debe ser: free, básico, profesional o empresarial',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priceMonthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get(): number {
        const value = this.getDataValue('priceMonthly');
        return value != null ? Number(value) : 0;
      },
      validate: {
        min: {
          args: [0],
          msg: 'El precio mensual no puede ser negativo',
        },
      },
    },
    priceYearly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get(): number {
        const value = this.getDataValue('priceYearly');
        return value != null ? Number(value) : 0;
      },
      validate: {
        min: {
          args: [0],
          msg: 'El precio anual no puede ser negativo',
        },
      },
    },
    stripePriceIdMonthly: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripePriceIdMonthly no puede exceder 255 caracteres',
        },
      },
    },
    stripePriceIdYearly: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripePriceIdYearly no puede exceder 255 caracteres',
        },
      },
    },
    stripeProductId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripeProductId no puede exceder 255 caracteres',
        },
      },
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isObjectOrNull(value: unknown): void {
          if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
            throw new Error('features debe ser un objeto');
          }
        },
      },
    },
    maxOrganizations: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'maxOrganizations debe ser al menos 1 cuando está definido',
        },
        isInt: {
          msg: 'maxOrganizations debe ser un número entero',
        },
      },
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'maxUsers debe ser al menos 1 cuando está definido',
        },
        isInt: {
          msg: 'maxUsers debe ser un número entero',
        },
      },
    },
    maxEventos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'maxEventos no puede ser negativo',
        },
        isInt: {
          msg: 'maxEventos debe ser un número entero',
        },
      },
    },
    maxActividades: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'maxActividades no puede ser negativo',
        },
        isInt: {
          msg: 'maxActividades debe ser un número entero',
        },
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
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
      { name: 'idx_subscription_plans_name', fields: ['name'] },
      { name: 'idx_subscription_plans_active', fields: ['active'] },
      { name: 'idx_subscription_plans_deleted_at', fields: ['deletedAt'] },
    ],
  }
);
