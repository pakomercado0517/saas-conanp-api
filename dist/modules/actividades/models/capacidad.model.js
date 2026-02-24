import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../shared/database/index.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import { Actividad } from './actividad.model.js';
export class Capacidad extends Model {
}
Capacidad.init({
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
    limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: [1],
                msg: 'El límite debe ser al menos 1',
            },
            isInt: {
                msg: 'El límite debe ser un número entero',
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
    modelName: 'Capacidad',
    tableName: 'capacidades',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            name: 'idx_capacidades_area',
            fields: ['areaId'],
        },
        {
            name: 'idx_capacidades_actividad',
            fields: ['actividadId'],
        },
        {
            name: 'idx_capacidades_actividad_date',
            unique: true,
            fields: ['actividadId', 'date'],
        },
        {
            name: 'idx_capacidades_date',
            fields: ['date'],
        },
    ],
});
Capacidad.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
Capacidad.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });
Area.hasMany(Capacidad, { foreignKey: 'areaId', as: 'Capacidades' });
Actividad.hasMany(Capacidad, { foreignKey: 'actividadId', as: 'Capacidades' });
//# sourceMappingURL=capacidad.model.js.map