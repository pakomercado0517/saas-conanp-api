import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
export class Organization extends Model {
}
Organization.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la organización es requerido',
            },
            len: {
                args: [1, 255],
                msg: 'El nombre debe tener entre 1 y 255 caracteres',
            },
        },
    },
    ecosystem_type: {
        type: DataTypes.ENUM('terrestre', 'maritimo', 'mixto'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['terrestre', 'maritimo', 'mixto']],
                msg: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
            },
        },
    },
    settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        validate: {
            isObject(value) {
                if (value !== null && typeof value !== 'object') {
                    throw new Error('Settings debe ser un objeto');
                }
            },
        },
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
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    subscriptionStatus: {
        type: DataTypes.VIRTUAL,
        get() {
            const sub = this.get('Subscription');
            return sub?.status;
        },
    },
    subscriptionExpiresAt: {
        type: DataTypes.VIRTUAL,
        get() {
            const sub = this.get('Subscription');
            return sub?.currentPeriodEnd ?? null;
        },
    },
}, {
    sequelize,
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_organizations_name',
            fields: ['name'],
        },
        {
            name: 'idx_organizations_ecosystem_type',
            fields: ['ecosystem_type'],
        },
    ],
});
//# sourceMappingURL=organization.model.js.map