import { Model, type Optional } from 'sequelize';
import type { UUID, EcosystemType, SubscriptionStatus } from '@/shared/database/types';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
export interface AreaAttributes {
    id: UUID;
    dependenciaId: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    /** Derivado de la suscripción activa de la dependencia (cuando se incluye Subscription) */
    subscriptionStatus?: SubscriptionStatus;
    /** Derivado de la suscripción activa - currentPeriodEnd (cuando se incluye Subscription) */
    subscriptionExpiresAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface AreaCreationAttributes extends Optional<AreaAttributes, 'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Area extends Model<AreaAttributes, AreaCreationAttributes> implements AreaAttributes {
    id: UUID;
    dependenciaId: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionExpiresAt?: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Dependencia?: Dependencia;
}
//# sourceMappingURL=area.model.d.ts.map