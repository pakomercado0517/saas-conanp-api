import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database';
import { Area } from '@/modules/areas/models/area.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
const PAYMENT_STATUSES = [
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'cancelled',
];
export class Payment extends Model {
}
Payment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    areaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'areas',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de área es requerido',
            },
        },
    },
    eventoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'eventos_operativos',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de evento es requerido',
            },
        },
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'El monto debe ser al menos 1 centavo',
            },
            isInt: {
                msg: 'El monto debe ser un número entero (centavos)',
            },
        },
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La moneda es requerida',
            },
            is: {
                args: [/^[A-Z]{3}$/],
                msg: 'La moneda debe ser código ISO 4217 de 3 letras mayúsculas (ej. MXN, USD)',
            },
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [PAYMENT_STATUSES],
                msg: 'El estado debe ser: pending, processing, succeeded, failed, refunded o cancelled',
            },
        },
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            startsWithPi(value) {
                if (value != null && value !== '' && !value.startsWith('pi_')) {
                    throw new Error('stripePaymentIntentId debe comenzar con pi_ (formato Stripe)');
                }
            },
        },
    },
    stripeChargeId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    stripeCustomerId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
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
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            onlyWhenFailed(value) {
                const status = this['get']('status');
                if (value != null && value !== '' && status !== 'failed') {
                    throw new Error('failureReason solo puede tener valor cuando el estado es failed');
                }
            },
        },
    },
    refundedAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'El monto reembolsado no puede ser negativo',
            },
            isInt: {
                msg: 'refundedAmount debe ser un número entero (centavos)',
            },
            notGreaterThanAmount(value) {
                const amount = this['get']('amount');
                if (amount != null && value > amount) {
                    throw new Error('El monto reembolsado no puede ser mayor al monto del pago');
                }
            },
        },
    },
    refundedAt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            onlyWhenRefunded(value) {
                const refundedAmount = this['get']('refundedAmount');
                if (value != null && value !== '' && (refundedAmount == null || refundedAmount <= 0)) {
                    throw new Error('refundedAt solo puede tener valor cuando refundedAmount es mayor a 0');
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
}, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        { name: 'idx_payments_area', fields: ['areaId'] },
        { name: 'idx_payments_evento', fields: ['eventoId'] },
        {
            name: 'idx_payments_stripe_payment_intent',
            fields: ['stripePaymentIntentId'],
        },
        { name: 'idx_payments_status', fields: ['status'] },
        { name: 'idx_payments_deleted_at', fields: ['deletedAt'] },
    ],
});
Payment.belongsTo(Area, {
    foreignKey: 'areaId',
    as: 'Area',
});
Payment.belongsTo(EventoOperativo, {
    foreignKey: 'eventoId',
    as: 'EventoOperativo',
});
Area.hasMany(Payment, {
    foreignKey: 'areaId',
    as: 'Payments',
});
EventoOperativo.hasMany(Payment, {
    foreignKey: 'eventoId',
    as: 'Payments',
});
//# sourceMappingURL=payment.model.js.map