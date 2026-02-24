import { Model, type Optional } from 'sequelize';
import type { UUID, EcosystemType, SubscriptionStatus } from '@/shared/database/types';
export interface OrganizationAttributes {
    id: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    /** Derivado de la suscripción activa (cuando se incluye Subscription) */
    subscriptionStatus?: SubscriptionStatus;
    /** Derivado de la suscripción activa - currentPeriodEnd (cuando se incluye Subscription) */
    subscriptionExpiresAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
    id: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionExpiresAt?: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=organization.model.d.ts.map