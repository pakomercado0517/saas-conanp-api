import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID, PaymentStatus } from '@/shared/database/types';
import { Area } from '@/modules/areas/models/area.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';

export interface PaymentAttributes {
  id: UUID;
  areaId: UUID;
  eventoId: UUID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeCustomerId: string | null;
  paymentMethod: string | null;
  metadata: Record<string, unknown> | null;
  failureReason: string | null;
  refundedAmount: number;
  refundedAt: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PaymentCreationAttributes extends Optional<
  PaymentAttributes,
  | 'id'
  | 'status'
  | 'stripePaymentIntentId'
  | 'stripeChargeId'
  | 'stripeCustomerId'
  | 'paymentMethod'
  | 'metadata'
  | 'failureReason'
  | 'refundedAmount'
  | 'refundedAt'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
  'cancelled',
];

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  declare id: UUID;
  declare areaId: UUID;
  declare eventoId: UUID;
  declare amount: number;
  declare currency: string;
  declare status: PaymentStatus;
  declare stripePaymentIntentId: string | null;
  declare stripeChargeId: string | null;
  declare stripeCustomerId: string | null;
  declare paymentMethod: string | null;
  declare metadata: Record<string, unknown> | null;
  declare failureReason: string | null;
  declare refundedAmount: number;
  declare refundedAt: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;

  declare Area?: Area;
  declare EventoOperativo?: EventoOperativo;
}

Payment.init(
  {
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
        startsWithPi(value: string | null): void {
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
        isObjectOrNull(value: unknown): void {
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
        onlyWhenFailed(value: string | null): void {
          const status = (this as unknown as Payment)['get']('status') as PaymentStatus | undefined;
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
        notGreaterThanAmount(value: number): void {
          const amount = (this as unknown as Payment)['get']('amount') as number | undefined;
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
        onlyWhenRefunded(value: string | null): void {
          const refundedAmount = (this as unknown as Payment)['get']('refundedAmount') as
            | number
            | undefined;
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
  },
  {
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
  }
);

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
