import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/shared/database';
import type { UUID } from '@/shared/database/types';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model';
import { Actividad } from '@/modules/actividades/models/actividad.model';

export interface PermisoAttributes {
  id: UUID;
  prestadorId: UUID;
  actividadId: UUID;
  validFrom: Date;
  validTo: Date;
  status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermisoCreationAttributes
  extends Optional<PermisoAttributes, 'id' | 'status' | 'documentUrl' | 'createdAt' | 'updatedAt'> {}

export class Permiso
  extends Model<PermisoAttributes, PermisoCreationAttributes>
  implements PermisoAttributes
{
  declare id: UUID;
  declare prestadorId: UUID;
  declare actividadId: UUID;
  declare validFrom: Date;
  declare validTo: Date;
  declare status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
  declare documentUrl: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Relaciones
  declare PrestadorProfile?: PrestadorProfile;
  declare Actividad?: Actividad;
}

Permiso.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'La fecha de inicio debe ser una fecha válida',
        },
      },
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'La fecha de fin debe ser una fecha válida',
        },
        isAfterValidFrom(value: Date): void {
          if (this.validFrom && value <= this.validFrom) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('activo', 'inactivo', 'vencido', 'suspendido'),
      allowNull: false,
      defaultValue: 'activo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'vencido', 'suspendido']],
          msg: 'El estado debe ser: activo, inactivo, vencido o suspendido',
        },
      },
    },
    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'La URL del documento debe ser una URL válida',
          args: {
            protocols: ['http', 'https'],
            require_protocol: true,
          },
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
    modelName: 'Permiso',
    tableName: 'permisos',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_permisos_prestador_actividad',
        fields: ['prestadorId', 'actividadId'],
      },
      {
        name: 'idx_permisos_prestador',
        fields: ['prestadorId'],
      },
      {
        name: 'idx_permisos_actividad',
        fields: ['actividadId'],
      },
      {
        name: 'idx_permisos_valid_dates',
        fields: ['validFrom', 'validTo'],
      },
      {
        name: 'idx_permisos_status',
        fields: ['status'],
      },
    ],
  }
);

// Definir relaciones
Permiso.belongsTo(PrestadorProfile, { foreignKey: 'prestadorId', as: 'PrestadorProfile' });
Permiso.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'Actividad' });

PrestadorProfile.hasMany(Permiso, { foreignKey: 'prestadorId', as: 'Permisos' });
Actividad.hasMany(Permiso, { foreignKey: 'actividadId', as: 'Permisos' });
