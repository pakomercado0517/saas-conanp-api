import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { User } from '../../../modules/users/models/user.model.js';
export class PrestadorProfile extends Model {
}
PrestadorProfile.init({
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
    dependenciaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'dependencias',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de dependencia es requerido',
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
    permitExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true,
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
    modelName: 'PrestadorProfile',
    tableName: 'prestador_profiles',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_prestador_profiles_user_dep',
            unique: true,
            fields: ['userId', 'dependenciaId'],
        },
        {
            name: 'idx_prestador_profiles_dependencia',
            fields: ['dependenciaId'],
        },
        {
            name: 'idx_prestador_profiles_user',
            fields: ['userId'],
        },
        {
            name: 'idx_prestador_profiles_status',
            fields: ['status'],
        },
        {
            name: 'idx_prestador_profiles_permit_expires',
            fields: ['permitExpiresAt'],
        },
    ],
});
PrestadorProfile.belongsTo(User, { foreignKey: 'userId', as: 'User' });
PrestadorProfile.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
User.hasMany(PrestadorProfile, { foreignKey: 'userId', as: 'PrestadorProfiles' });
Dependencia.hasMany(PrestadorProfile, { foreignKey: 'dependenciaId', as: 'PrestadorProfiles' });
//# sourceMappingURL=prestador-profile.model.js.map