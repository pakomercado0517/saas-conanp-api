import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model.js';
export const SUBSCRIPTION_STATUSES = [
    'active',
    'canceled',
    'past_due',
    'unpaid',
    'trialing',
    'incomplete',
    'incomplete_expired',
];
export const BILLING_CYCLES = ['monthly', 'yearly'];
export class Subscription extends Model {
}
Subscription.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    dependenciaId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'dependencias',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de dependencia es requerido',
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
        type: DataTypes.ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired'),
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
            afterPeriodStart(value) {
                const start = this.get('currentPeriodStart');
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
            onlyWhenCanceled(value) {
                const status = this.get('status');
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
            isObjectOrNull(value) {
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
}, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        { name: 'idx_subscriptions_dependencia_id', fields: ['dependenciaId'] },
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
});
Subscription.belongsTo(Dependencia, {
    foreignKey: 'dependenciaId',
    as: 'Dependencia',
});
Subscription.belongsTo(SubscriptionPlan, {
    foreignKey: 'planId',
    as: 'SubscriptionPlan',
});
Dependencia.hasOne(Subscription, {
    foreignKey: 'dependenciaId',
    as: 'Subscription',
});
SubscriptionPlan.hasMany(Subscription, {
    foreignKey: 'planId',
    as: 'Subscriptions',
});
//# sourceMappingURL=subscription.model.js.map