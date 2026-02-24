import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model';
export interface EvidenciaAmbientalAttributes {
    id: UUID;
    eventoId: UUID;
    type: string;
    description: string | null;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface EvidenciaAmbientalCreationAttributes extends Optional<EvidenciaAmbientalAttributes, 'id' | 'description' | 'fileUrl' | 'createdAt' | 'updatedAt'> {
}
export declare class EvidenciaAmbiental extends Model<EvidenciaAmbientalAttributes, EvidenciaAmbientalCreationAttributes> implements EvidenciaAmbientalAttributes {
    id: UUID;
    eventoId: UUID;
    type: string;
    description: string | null;
    fileUrl: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    EventoOperativo?: EventoOperativo;
}
//# sourceMappingURL=evidencia-ambiental.model.d.ts.map