import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from './dependencia.model.js';
import { User } from '../../../modules/users/models/user.model.js';
export class DependenciaMembership extends Model {
}
const ROLE_VALUES = ['owner', 'admin', 'gestor', 'prestador', 'observador'];
DependenciaMembership.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    dependenciaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dependencias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    role: {
        type: DataTypes.ENUM(...ROLE_VALUES),
        allowNull: false,
        validate: {
            isIn: {
                args: [ROLE_VALUES],
                msg: 'El rol debe ser: owner, admin, gestor, prestador u observador',
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
    modelName: 'DependenciaMembership',
    tableName: 'dependencia_memberships',
    timestamps: true,
    underscored: false,
    indexes: [
        { name: 'idx_dep_memberships_user_dep', unique: true, fields: ['userId', 'dependenciaId'] },
        { name: 'idx_dep_memberships_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_dep_memberships_user', fields: ['userId'] },
        { name: 'idx_dep_memberships_role', fields: ['role'] },
        { name: 'idx_dep_memberships_status', fields: ['status'] },
    ],
});
DependenciaMembership.belongsTo(User, { foreignKey: 'userId', as: 'User' });
DependenciaMembership.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
User.hasMany(DependenciaMembership, { foreignKey: 'userId', as: 'DependenciaMemberships' });
Dependencia.hasMany(DependenciaMembership, {
    foreignKey: 'dependenciaId',
    as: 'DependenciaMemberships',
});
//# sourceMappingURL=dependencia-membership.model.js.map