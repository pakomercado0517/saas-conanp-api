import { Model, type Optional } from 'sequelize';
import type { UUID, ActividadType, AgendaType } from '../../../shared/database/types.js';
import { Organization } from '../../../modules/organizations/models/organization.model.js';
export interface ActividadAttributes {
    id: UUID;
    organizationId: UUID;
    name: string;
    type: ActividadType;
    agendaType: AgendaType;
    requiresGuide: boolean;
    impactLevel: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface ActividadCreationAttributes extends Optional<ActividadAttributes, 'id' | 'requiresGuide' | 'impactLevel' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Actividad extends Model<ActividadAttributes, ActividadCreationAttributes> implements ActividadAttributes {
    id: UUID;
    organizationId: UUID;
    name: string;
    type: ActividadType;
    agendaType: AgendaType;
    requiresGuide: boolean;
    impactLevel: string | null;
    active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
    Organization?: Organization;
}
//# sourceMappingURL=actividad.model.d.ts.map