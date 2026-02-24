import { Model, type Optional } from 'sequelize';
import type { UUID } from '@/shared/database/types';
export interface StripeWebhookEventAttributes {
    id: UUID;
    eventId: string;
    eventType: string;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface StripeWebhookEventCreationAttributes extends Optional<StripeWebhookEventAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class StripeWebhookEvent extends Model<StripeWebhookEventAttributes, StripeWebhookEventCreationAttributes> implements StripeWebhookEventAttributes {
    id: UUID;
    eventId: string;
    eventType: string;
    processedAt: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=stripe-webhook-event.model.d.ts.map