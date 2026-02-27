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
    passwordResetToken: string | null;
    passwordResetExpiresAt: Date | null;
    onboardingStatus: 'pending_setup' | 'completed';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'emailVerified' | 'emailVerificationToken' | 'emailVerificationExpiresAt' | 'passwordResetToken' | 'passwordResetExpiresAt' | 'onboardingStatus' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: UUID;
    email: string;
    password: string;
    name: string;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpiresAt: Date | null;
    passwordResetToken: string | null;
    passwordResetExpiresAt: Date | null;
    onboardingStatus: 'pending_setup' | 'completed';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=user.model.d.ts.map