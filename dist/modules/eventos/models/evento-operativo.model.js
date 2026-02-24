import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database';
import { Area } from '@/modules/areas/models/area.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { Bloque } from '@/modules/actividades/models/bloque.model.js';
export class EventoOperativo extends Model {
}
EventoOperativo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    areaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'areas',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de área es requerido',
            },
        },
    },
    prestadorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'prestador_profiles',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de prestador es requerido',
            },
        },
    },
    actividadId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'actividades',
            key: 'id',
        },
        validate: {
            notEmpty: {
                msg: 'El ID de actividad es requerido',
            },
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    bloqueId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'bloques',
            key: 'id',
        },
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
            isAfterStartTime(value) {
                if (this['startTime'] && value && value <= this['startTime']) {
                    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
                }
            },
        },
    },
    peopleCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: [1],
                msg: 'El número de personas debe ser al menos 1',
            },
            isInt: {
                msg: 'El número de personas debe ser un número entero',
            },
        },
    },
    status: {
        type: DataTypes.ENUM('programado', 'en_curso', 'completado', 'cancelado'),
        allowNull: false,
        defaultValue: 'programado',
        validate: {
            isIn: {
                args: [['programado', 'en_curso', 'completado', 'cancelado']],
                msg: 'El estado debe ser: programado, en_curso, completado o cancelado',
            },
        },
    },
    paymentRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    paidAt: {
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
    modelName: 'EventoOperativo',
    tableName: 'eventos_operativos',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_eventos_operativos_area',
            fields: ['areaId'],
        },
        {
            name: 'idx_eventos_operativos_prestador',
            fields: ['prestadorId'],
        },
        {
            name: 'idx_eventos_operativos_actividad',
            fields: ['actividadId'],
        },
        {
            name: 'idx_eventos_operativos_area_date',
            fields: ['areaId', 'date'],
        },
        {
            name: 'idx_eventos_operativos_date',
            fields: ['date'],
        },
        {
            name: 'idx_eventos_operativos_bloque',
            fields: ['bloqueId'],
        },
        {
            name: 'idx_eventos_operativos_status',
            fields: ['status'],
        },
        {
            name: 'idx_eventos_operativos_payment_required',
            fields: ['paymentRequired'],
        },
    ],
});
EventoOperativo.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
EventoOperativo.belongsTo(PrestadorProfile, { foreignKey: 'prestadorId', as: 'PrestadorProfile' });
EventoOperativo.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });
EventoOperativo.belongsTo(Bloque, { foreignKey: 'bloqueId', as: 'Bloque' });
Area.hasMany(EventoOperativo, { foreignKey: 'areaId', as: 'EventosOperativos' });
PrestadorProfile.hasMany(EventoOperativo, { foreignKey: 'prestadorId', as: 'EventosOperativos' });
Actividad.hasMany(EventoOperativo, { foreignKey: 'actividadId', as: 'EventosOperativos' });
Bloque.hasMany(EventoOperativo, { foreignKey: 'bloqueId', as: 'EventosOperativos' });
//# sourceMappingURL=evento-operativo.model.js.map