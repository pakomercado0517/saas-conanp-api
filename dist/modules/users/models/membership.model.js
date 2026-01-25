import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { User } from './user.model';
export class Membership extends Model {
}
Membership.init({
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
        validate: {
            notEmpty: {
                msg: 'El ID de usuario es requerido',
            },
        },
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de organización es requerido',
            },
        },
    },
    role: {
        type: DataTypes.ENUM('admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['admin', 'gestor', 'prestador', 'observador']],
                msg: 'El rol debe ser: admin, gestor, prestador u observador',
            },
        },
    },
    status: {
        type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
        validate: {
            isIn: {
                args: [['activo', 'inactivo', 'suspendido']],
                msg: 'El estado debe ser: activo, inactivo o suspendido',
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
}, {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_memberships_user_org',
            unique: true,
            fields: ['userId', 'organizationId'],
        },
        {
            name: 'idx_memberships_organization',
            fields: ['organizationId'],
        },
        {
            name: 'idx_memberships_user',
            fields: ['userId'],
        },
        {
            name: 'idx_memberships_role',
            fields: ['role'],
        },
        {
            name: 'idx_memberships_status',
            fields: ['status'],
        },
    ],
});
// Definir relaciones
Membership.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Membership.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
User.hasMany(Membership, { foreignKey: 'userId', as: 'Memberships' });
Organization.hasMany(Membership, { foreignKey: 'organizationId', as: 'Memberships' });
//# sourceMappingURL=membership.model.js.map