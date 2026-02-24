import { Model, type Optional } from 'sequelize';
import type { UUID, SubscriptionStatus, BillingCycle } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
export interface SubscriptionAttributes {
    id: UUID;
    dependenciaId: UUID;
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
export interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'cancelAtPeriodEnd' | 'canceledAt' | 'stripeSubscriptionId' | 'stripeCustomerId' | 'stripePriceId' | 'metadata' | 'trialEnd' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare const SUBSCRIPTION_STATUSES: SubscriptionStatus[];
export declare const BILLING_CYCLES: BillingCycle[];
export declare class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
    id: UUID;
    dependenciaId: UUID;
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Dependencia?: Dependencia;
    SubscriptionPlan?: SubscriptionPlan;
}
//# sourceMappingURL=subscription.model.d.ts.map