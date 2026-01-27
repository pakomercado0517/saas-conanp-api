import { Model, type Optional } from 'sequelize';
import type { UUID, PaymentStatus } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model';
export interface PaymentAttributes {
    id: UUID;
    organizationId: UUID;
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
    organizationId: UUID;
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
    Organization?: Organization;
    EventoOperativo?: EventoOperativo;
}
//# sourceMappingURL=payment.model.d.ts.map