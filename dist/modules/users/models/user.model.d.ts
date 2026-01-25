import { Model, type Optional } from 'sequelize';
import type { UUID } from '../../../shared/database/types';
export interface UserAttributes {
    id: UUID;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: UUID;
    email: string;
    password: string;
    name: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=user.model.d.ts.map