import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';

export interface StripeWebhookEventAttributes {
  id: UUID;
  eventId: string;
  eventType: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeWebhookEventCreationAttributes extends Optional<
  StripeWebhookEventAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

export class StripeWebhookEvent
  extends Model<StripeWebhookEventAttributes, StripeWebhookEventCreationAttributes>
  implements StripeWebhookEventAttributes
{
  declare id: UUID;
  declare eventId: string;
  declare eventType: string;
  declare processedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

StripeWebhookEvent.init(
  {
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
  },
  {
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
  }
);
