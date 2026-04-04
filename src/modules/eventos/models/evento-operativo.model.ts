import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Area } from '@/modules/areas/models/area.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { Bloque } from '@/modules/actividades/models/bloque.model.js';
import { User } from '@/modules/users/models/user.model.js';

export interface EventoOperativoAttributes {
  id: UUID;
  areaId: UUID;
  prestadorId: UUID;
  actividadId: UUID;
  date: string;
  bloqueId: UUID | null;
  startTime: string | null;
  endTime: string | null;
  peopleCount: number;
  status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  paymentRequired: boolean;
  paidAt: Date | null;
  createdByUserId: UUID | null;
  updatedByUserId: UUID | null;
  capacityOverride: boolean;
  capacityOverrideReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventoOperativoCreationAttributes extends Optional<
  EventoOperativoAttributes,
  | 'id'
  | 'bloqueId'
  | 'startTime'
  | 'endTime'
  | 'peopleCount'
  | 'status'
  | 'paymentRequired'
  | 'paidAt'
  | 'createdByUserId'
  | 'updatedByUserId'
  | 'capacityOverride'
  | 'capacityOverrideReason'
  | 'createdAt'
  | 'updatedAt'
> {}

export class EventoOperativo
  extends Model<EventoOperativoAttributes, EventoOperativoCreationAttributes>
  implements EventoOperativoAttributes
{
  declare id: UUID;
  declare areaId: UUID;
  declare prestadorId: UUID;
  declare actividadId: UUID;
  declare date: string;
  declare bloqueId: UUID | null;
  declare startTime: string | null;
  declare endTime: string | null;
  declare peopleCount: number;
  declare status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  declare paymentRequired: boolean;
  declare paidAt: Date | null;
  declare createdByUserId: UUID | null;
  declare updatedByUserId: UUID | null;
  declare capacityOverride: boolean;
  declare capacityOverrideReason: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Area?: Area;
  declare PrestadorProfile?: PrestadorProfile;
  declare Actividad?: Actividad;
  declare Bloque?: Bloque | null;
  declare CreatedByUser?: User;
  declare UpdatedByUser?: User;
}

EventoOperativo.init(
  {
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
        isAfterStartTime(value: string | null): void {
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
    createdByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    updatedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    capacityOverride: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    capacityOverrideReason: {
      type: DataTypes.TEXT,
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
  },
  {
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
  }
);

EventoOperativo.belongsTo(Area, { foreignKey: 'areaId', as: 'Area' });
EventoOperativo.belongsTo(PrestadorProfile, { foreignKey: 'prestadorId', as: 'PrestadorProfile' });
EventoOperativo.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });
EventoOperativo.belongsTo(Bloque, { foreignKey: 'bloqueId', as: 'Bloque' });
EventoOperativo.belongsTo(User, { foreignKey: 'createdByUserId', as: 'CreatedByUser' });
EventoOperativo.belongsTo(User, { foreignKey: 'updatedByUserId', as: 'UpdatedByUser' });

Area.hasMany(EventoOperativo, { foreignKey: 'areaId', as: 'EventosOperativos' });
PrestadorProfile.hasMany(EventoOperativo, { foreignKey: 'prestadorId', as: 'EventosOperativos' });
Actividad.hasMany(EventoOperativo, { foreignKey: 'actividadId', as: 'EventosOperativos' });
Bloque.hasMany(EventoOperativo, { foreignKey: 'bloqueId', as: 'EventosOperativos' });
