import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database';
export class StripeWebhookEvent extends Model {
}
StripeWebhookEvent.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    eventId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'event_id',
    },
    eventType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'event_type',
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'processed_at',
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
}, {
    sequelize,
    modelName: 'StripeWebhookEvent',
    tableName: 'stripe_webhook_events',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_stripe_webhook_events_event_id',
            unique: true,
            fields: ['eventId'],
        },
    ],
});
//# sourceMappingURL=stripe-webhook-event.model.js.map