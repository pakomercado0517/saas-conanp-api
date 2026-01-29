import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model';
import { Actividad } from '../../../modules/actividades/models/actividad.model';
import { Bloque } from '../../../modules/actividades/models/bloque.model';
export interface EventoOperativoAttributes {
    id: UUID;
    organizationId: UUID;
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
    createdAt: Date;
    updatedAt: Date;
}
export interface EventoOperativoCreationAttributes extends Optional<EventoOperativoAttributes, 'id' | 'bloqueId' | 'startTime' | 'endTime' | 'peopleCount' | 'status' | 'paymentRequired' | 'paidAt' | 'createdAt' | 'updatedAt'> {
}
export declare class EventoOperativo extends Model<EventoOperativoAttributes, EventoOperativoCreationAttributes> implements EventoOperativoAttributes {
    id: UUID;
    organizationId: UUID;
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Organization?: Organization;
    PrestadorProfile?: PrestadorProfile;
    Actividad?: Actividad;
    Bloque?: Bloque | null;
}
//# sourceMappingURL=evento-operativo.model.d.ts.map