import { Model, type Optional } from 'sequelize';
import type { UUID, SubscriptionPlanName } from '../../../shared/database/types';
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
export interface SubscriptionPlanCreationAttributes extends Optional<SubscriptionPlanAttributes, 'id' | 'description' | 'stripePriceIdMonthly' | 'stripePriceIdYearly' | 'stripeProductId' | 'features' | 'maxOrganizations' | 'maxUsers' | 'maxEventos' | 'maxActividades' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare const SUBSCRIPTION_PLAN_NAMES: SubscriptionPlanName[];
export declare class SubscriptionPlan extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes> implements SubscriptionPlanAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=subscription-plan.model.d.ts.map