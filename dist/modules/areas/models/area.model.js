import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
export class Area extends Model {
}
Area.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    dependenciaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dependencias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del área es requerido' },
            len: { args: [1, 255], msg: 'El nombre debe tener entre 1 y 255 caracteres' },
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
            const dep = this.get('Dependencia');
            return dep?.Subscription?.status;
        },
    },
    subscriptionExpiresAt: {
        type: DataTypes.VIRTUAL,
        get() {
            const dep = this.get('Dependencia');
            return dep?.Subscription?.currentPeriodEnd ?? null;
        },
    },
}, {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        { name: 'idx_areas_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_areas_name', fields: ['name'] },
        { name: 'idx_areas_ecosystem_type', fields: ['ecosystem_type'] },
    ],
});
Area.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
Dependencia.hasMany(Area, { foreignKey: 'dependenciaId', as: 'Areas' });
//# sourceMappingURL=area.model.js.map