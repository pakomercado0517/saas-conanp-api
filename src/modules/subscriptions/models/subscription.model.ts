import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, SubscriptionStatus, BillingCycle } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model';

export interface SubscriptionAttributes {
  id: UUID;
  organizationId: UUID;
  planId: UUID;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  metadata: Record<string, unknown> | null;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SubscriptionCreationAttributes extends Optional<
  SubscriptionAttributes,
  | 'id'
  | 'cancelAtPeriodEnd'
  | 'canceledAt'
  | 'stripeSubscriptionId'
  | 'stripeCustomerId'
  | 'stripePriceId'
  | 'metadata'
  | 'trialEnd'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'active',
  'canceled',
  'past_due',
  'unpaid',
  'trialing',
  'incomplete',
  'incomplete_expired',
];

export const BILLING_CYCLES: BillingCycle[] = ['monthly', 'yearly'];

export class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare planId: UUID;
  declare status: SubscriptionStatus;
  declare billingCycle: BillingCycle;
  declare currentPeriodStart: Date;
  declare currentPeriodEnd: Date;
  declare cancelAtPeriodEnd: boolean;
  declare canceledAt: Date | null;
  declare stripeSubscriptionId: string | null;
  declare stripeCustomerId: string | null;
  declare stripePriceId: string | null;
  declare metadata: Record<string, unknown> | null;
  declare trialEnd: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;

  declare Organization?: Organization;
  declare SubscriptionPlan?: SubscriptionPlan;
}

Subscription.init(
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
      unique: true,
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
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id',
      },
      validate: {
        notEmpty: {
          msg: 'El ID del plan es requerido',
        },
      },
    },
    status: {
      type: DataTypes.ENUM(
        'active',
        'canceled',
        'past_due',
        'unpaid',
        'trialing',
        'incomplete',
        'incomplete_expired'
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [SUBSCRIPTION_STATUSES],
          msg: 'El estado debe ser uno de: active, canceled, past_due, unpaid, trialing, incomplete, incomplete_expired',
        },
      },
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
      validate: {
        isIn: {
          args: [BILLING_CYCLES],
          msg: 'El ciclo de facturación debe ser: monthly o yearly',
        },
      },
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La fecha de inicio del periodo es requerida',
        },
      },
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La fecha de fin del periodo es requerida',
        },
        afterPeriodStart(value: Date): void {
          const start = (this as unknown as Subscription).get('currentPeriodStart') as
            | Date
            | undefined;
          if (start != null && value <= start) {
            throw new Error('currentPeriodEnd debe ser posterior a currentPeriodStart');
          }
        },
      },
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        onlyWhenCanceled(value: Date | null): void {
          const status = (this as unknown as Subscription).get('status') as
            | SubscriptionStatus
            | undefined;
          if (value != null && status !== 'canceled') {
            throw new Error('canceledAt solo puede tener valor cuando el estado es canceled');
          }
        },
      },
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripeSubscriptionId no puede exceder 255 caracteres',
        },
      },
    },
    stripeCustomerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripeCustomerId no puede exceder 255 caracteres',
        },
      },
    },
    stripePriceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'stripePriceId no puede exceder 255 caracteres',
        },
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isObjectOrNull(value: unknown): void {
          if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
            throw new Error('metadata debe ser un objeto');
          }
        },
      },
    },
    trialEnd: {
      type: DataTypes.DATE,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
      { name: 'idx_subscriptions_organization_id', fields: ['organizationId'] },
      { name: 'idx_subscriptions_status', fields: ['status'] },
      {
        name: 'idx_subscriptions_stripe_subscription_id',
        fields: ['stripeSubscriptionId'],
      },
      {
        name: 'idx_subscriptions_current_period_end',
        fields: ['currentPeriodEnd'],
      },
      { name: 'idx_subscriptions_deleted_at', fields: ['deletedAt'] },
    ],
  }
);

Subscription.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'Organization',
});

Subscription.belongsTo(SubscriptionPlan, {
  foreignKey: 'planId',
  as: 'SubscriptionPlan',
});

Organization.hasMany(Subscription, {
  foreignKey: 'organizationId',
  as: 'Subscriptions',
});

SubscriptionPlan.hasMany(Subscription, {
  foreignKey: 'planId',
  as: 'Subscriptions',
});
