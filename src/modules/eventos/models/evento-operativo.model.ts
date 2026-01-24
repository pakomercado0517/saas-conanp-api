import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { Organization } from '@/modules/organizations/models/organization.model';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model';
import { Actividad } from '@/modules/actividades/models/actividad.model';
import { Bloque } from '@/modules/actividades/models/bloque.model';

export interface EventoOperativoAttributes {
  id: UUID;
  organizationId: UUID;
  prestadorId: UUID;
  actividadId: UUID;
  date: string; // DATEONLY se representa como string en formato YYYY-MM-DD
  bloqueId: UUID | null;
  startTime: string | null; // TIME se representa como string en formato HH:mm:ss
  endTime: string | null; // TIME se representa como string en formato HH:mm:ss
  peopleCount: number;
  status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventoOperativoCreationAttributes
  extends Optional<EventoOperativoAttributes, 'id' | 'bloqueId' | 'startTime' | 'endTime' | 'peopleCount' | 'status' | 'createdAt' | 'updatedAt'> {}

export class EventoOperativo
  extends Model<EventoOperativoAttributes, EventoOperativoCreationAttributes>
  implements EventoOperativoAttributes
{
  declare id: UUID;
  declare organizationId: UUID;
  declare prestadorId: UUID;
  declare actividadId: UUID;
  declare date: string;
  declare bloqueId: UUID | null;
  declare startTime: string | null;
  declare endTime: string | null;
  declare peopleCount: number;
  declare status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare Organization?: Organization;
  declare PrestadorProfile?: PrestadorProfile;
  declare Actividad?: Actividad;
  declare Bloque?: Bloque | null;
}

EventoOperativo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
        isDate: {
          msg: 'La fecha debe ser una fecha válida',
        },
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
          if (this.startTime && value && value <= this.startTime) {
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
        name: 'idx_eventos_operativos_organization',
        fields: ['organizationId'],
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
        name: 'idx_eventos_operativos_org_date',
        fields: ['organizationId', 'date'],
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
    ],
  }
);

// Definir relaciones
EventoOperativo.belongsTo(Organization, { foreignKey: 'organizationId', as: 'Organization' });
EventoOperativo.belongsTo(PrestadorProfile, { foreignKey: 'prestadorId', as: 'PrestadorProfile' });
EventoOperativo.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });
EventoOperativo.belongsTo(Bloque, { foreignKey: 'bloqueId', as: 'Bloque' });

Organization.hasMany(EventoOperativo, { foreignKey: 'organizationId', as: 'EventosOperativos' });
PrestadorProfile.hasMany(EventoOperativo, { foreignKey: 'prestadorId', as: 'EventosOperativos' });
Actividad.hasMany(EventoOperativo, { foreignKey: 'actividadId', as: 'EventosOperativos' });
Bloque.hasMany(EventoOperativo, { foreignKey: 'bloqueId', as: 'EventosOperativos' });
