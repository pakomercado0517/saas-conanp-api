import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/shared/database/index.js';
import { Area } from '@/modules/areas/models/area.model.js';
export class Actividad extends Model {
}
Actividad.init({
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
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la actividad es requerido',
            },
            len: {
                args: [1, 255],
                msg: 'El nombre debe tener entre 1 y 255 caracteres',
            },
        },
    },
    type: {
        type: DataTypes.ENUM('terrestre', 'maritima', 'mixta'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['terrestre', 'maritima', 'mixta']],
                msg: 'El tipo debe ser: terrestre, maritima o mixta',
            },
        },
    },
    agendaType: {
        type: DataTypes.ENUM('BLOQUES', 'HORARIO_LIBRE'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['BLOQUES', 'HORARIO_LIBRE']],
                msg: 'El tipo de agenda debe ser: BLOQUES o HORARIO_LIBRE',
            },
        },
    },
    requiresGuide: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    impactLevel: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            len: {
                args: [0, 50],
                msg: 'El nivel de impacto no puede exceder 50 caracteres',
            },
        },
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    modelName: 'Actividad',
    tableName: 'actividades',
    timestamps: true,
    paranoid: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_actividades_area',
            fields: ['areaId'],
        },
        {
            name: 'idx_actividades_area_active',
            fields: ['areaId', 'active'],
        },
        {
            name: 'idx_actividades_type',
            fields: ['type'],
        },
        {
            name: 'idx_actividades_agenda_type',
            fields: ['agendaType'],
        },
    ],
});
Actividad.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
Area.hasMany(Actividad, { foreignKey: 'areaId', as: 'Actividades' });
//# sourceMappingURL=actividad.model.js.map