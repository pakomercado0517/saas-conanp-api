import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
export class User extends Model {
}
User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'El email debe tener un formato válido',
            },
            notEmpty: {
                msg: 'El email es requerido',
            },
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La contraseña es requerida',
            },
            len: {
                args: [8, 255],
                msg: 'La contraseña debe tener al menos 8 caracteres',
            },
        },
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre es requerido',
            },
            len: {
                args: [1, 255],
                msg: 'El nombre debe tener entre 1 y 255 caracteres',
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
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_users_email_unique',
            unique: true,
            fields: ['email'],
        },
    ],
});
//# sourceMappingURL=user.model.js.map