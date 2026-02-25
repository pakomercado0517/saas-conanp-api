import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from './dependencia.model.js';
import { User } from '../../../modules/users/models/user.model.js';
export class DependenciaInvitation extends Model {
}
DependenciaInvitation.init({
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
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('owner', 'admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
    },
    tokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    invitedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'pending',
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
    modelName: 'DependenciaInvitation',
    tableName: 'dependencia_invitations',
    timestamps: true,
    underscored: false,
    indexes: [
        { name: 'idx_dependencia_invitations_token_hash', unique: true, fields: ['tokenHash'] },
        {
            name: 'idx_dep_invitations_dep_email_status',
            fields: ['dependenciaId', 'email', 'status'],
        },
        { name: 'idx_dep_invitations_expires_at', fields: ['expiresAt'] },
        { name: 'idx_dep_invitations_dependencia', fields: ['dependenciaId'] },
        { name: 'idx_dep_invitations_email', fields: ['email'] },
    ],
});
DependenciaInvitation.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
DependenciaInvitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'InvitedByUser' });
Dependencia.hasMany(DependenciaInvitation, {
    foreignKey: 'dependenciaId',
    as: 'DependenciaInvitations',
});
User.hasMany(DependenciaInvitation, { foreignKey: 'invitedBy', as: 'DependenciaInvitationsSent' });
//# sourceMappingURL=dependencia-invitation.model.js.map