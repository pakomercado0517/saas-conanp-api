import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
export class Activo extends Model {
}
Activo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'prestador_profiles',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID del propietario es requerido',
            },
        },
    },
    type: {
        type: DataTypes.ENUM('embarcacion', 'vehiculo', 'guia', 'equipo'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['embarcacion', 'vehiculo', 'guia', 'equipo']],
                msg: 'El tipo debe ser: embarcacion, vehiculo, guia o equipo',
            },
        },
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido'),
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: {
                args: [['pendiente', 'aprobado', 'rechazado', 'suspendido']],
                msg: 'El estado debe ser: pendiente, aprobado, rechazado o suspendido',
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
    modelName: 'Activo',
    tableName: 'activos',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_activos_dependencia',
            fields: ['dependenciaId'],
        },
        {
            name: 'idx_activos_owner',
            fields: ['ownerId'],
        },
        {
            name: 'idx_activos_dep_owner',
            fields: ['dependenciaId', 'ownerId'],
        },
        {
            name: 'idx_activos_type',
            fields: ['type'],
        },
        {
            name: 'idx_activos_status',
            fields: ['status'],
        },
        {
            name: 'idx_activos_dep_status',
            fields: ['dependenciaId', 'status'],
        },
        {
            name: 'idx_activos_deleted_at',
            fields: ['deletedAt'],
        },
    ],
});
// Definir relaciones
Activo.belongsTo(Dependencia, { foreignKey: 'dependenciaId', as: 'Dependencia' });
Activo.belongsTo(PrestadorProfile, { foreignKey: 'ownerId', as: 'Owner' });
Dependencia.hasMany(Activo, { foreignKey: 'dependenciaId', as: 'Activos' });
PrestadorProfile.hasMany(Activo, { foreignKey: 'ownerId', as: 'Activos' });
//# sourceMappingURL=activo.model.js.map