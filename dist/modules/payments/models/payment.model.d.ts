import { Model, type Optional } from 'sequelize';
import type { UUID, PaymentStatus } from '../../../shared/database/types';
import { Area } from '../../../modules/areas/models/area.model.js';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model.js';
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
export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'stripePaymentIntentId' | 'stripeChargeId' | 'stripeCustomerId' | 'paymentMethod' | 'metadata' | 'failureReason' | 'refundedAmount' | 'refundedAt' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Area?: Area;
    EventoOperativo?: EventoOperativo;
}
//# sourceMappingURL=payment.model.d.ts.map