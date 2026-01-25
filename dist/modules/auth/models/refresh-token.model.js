import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
export class RefreshToken extends Model {
}
RefreshToken.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Usuario propietario del token',
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
        comment: 'Token de refresh hasheado con bcrypt',
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del token',
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Fecha de revocación del token (null si está activo)',
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
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_refresh_tokens_user_id',
            fields: ['userId'],
        },
        {
            name: 'idx_refresh_tokens_token_unique',
            unique: true,
            fields: ['token'],
        },
        {
            name: 'idx_refresh_tokens_expires_at',
            fields: ['expiresAt'],
        },
        {
            name: 'idx_refresh_tokens_user_expires',
            fields: ['userId', 'expiresAt'],
        },
    ],
});
//# sourceMappingURL=refresh-token.model.js.map