import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Area } from '../../../modules/areas/models/area.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import { Bloque } from '../../../modules/actividades/models/bloque.model.js';
import { User } from '../../../modules/users/models/user.model.js';
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
export interface EventoOperativoCreationAttributes extends Optional<EventoOperativoAttributes, 'id' | 'bloqueId' | 'startTime' | 'endTime' | 'peopleCount' | 'status' | 'paymentRequired' | 'paidAt' | 'createdByUserId' | 'updatedByUserId' | 'capacityOverride' | 'capacityOverrideReason' | 'createdAt' | 'updatedAt'> {
}
export declare class EventoOperativo extends Model<EventoOperativoAttributes, EventoOperativoCreationAttributes> implements EventoOperativoAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Area?: Area;
    PrestadorProfile?: PrestadorProfile;
    Actividad?: Actividad;
    Bloque?: Bloque | null;
    CreatedByUser?: User;
    UpdatedByUser?: User;
}
//# sourceMappingURL=evento-operativo.model.d.ts.map