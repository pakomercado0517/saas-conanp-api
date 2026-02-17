import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
export interface UserAttributes {
    id: UUID;
    email: string;
    password: string;
    name: string;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'emailVerified' | 'emailVerificationToken' | 'emailVerificationExpiresAt' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: UUID;
    email: string;
    password: string;
    name: string;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpiresAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=user.model.d.ts.map