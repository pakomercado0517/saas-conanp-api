import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
export interface RefreshTokenAttributes {
    id: UUID;
    userId: UUID;
    token: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'revokedAt' | 'createdAt' | 'updatedAt'> {
}
export declare class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    id: UUID;
    userId: UUID;
    token: string;
    expiresAt: Date;
    revokedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=refresh-token.model.d.ts.map