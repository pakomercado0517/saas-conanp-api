import { Model, type Optional } from 'sequelize';
import type { UUID, ActivoType } from '../../../shared/database/types';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
export type CatalogoTipoDato = 'string' | 'date' | 'number';
export interface ActivoRequisitoCatalogoAttributes {
    id: UUID;
    dependenciaId: UUID;
    tipoActivo: ActivoType;
    key: string;
    label: string | null;
    tipoDato: CatalogoTipoDato;
    requerido: boolean;
    requiereDocumento: boolean;
    orden: number | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ActivoRequisitoCatalogoCreationAttributes extends Optional<ActivoRequisitoCatalogoAttributes, 'id' | 'label' | 'requerido' | 'requiereDocumento' | 'orden' | 'activo' | 'createdAt' | 'updatedAt'> {
}
export declare class ActivoRequisitoCatalogo extends Model<ActivoRequisitoCatalogoAttributes, ActivoRequisitoCatalogoCreationAttributes> implements ActivoRequisitoCatalogoAttributes {
    id: UUID;
    dependenciaId: UUID;
    tipoActivo: ActivoType;
    key: string;
    label: string | null;
    tipoDato: CatalogoTipoDato;
    requerido: boolean;
    requiereDocumento: boolean;
    orden: number | null;
    activo: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    Dependencia?: Dependencia;
}
//# sourceMappingURL=activo-requisito-catalogo.model.d.ts.map