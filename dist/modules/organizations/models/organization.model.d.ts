import { Model, type Optional } from 'sequelize';
import type { UUID, EcosystemType } from '../../../shared/database/types';
export interface OrganizationAttributes {
    id: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'settings' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
    id: UUID;
    name: string;
    ecosystem_type: EcosystemType;
    settings: Record<string, unknown>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=organization.model.d.ts.map