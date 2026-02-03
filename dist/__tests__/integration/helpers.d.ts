import type { Application } from 'express';
import request from 'supertest';
import type { UUID } from '../../shared/database/types.js';
export interface AuthResult {
    user: {
        id: string;
        email: string;
        name: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
/**
 * Registra un usuario vía API y devuelve usuario y tokens.
 */
export declare function createTestUserAndToken(app: Application, overrides?: {
    email?: string;
    password?: string;
    name?: string;
}): Promise<AuthResult>;
/**
 * Inicia sesión y devuelve tokens.
 */
export declare function loginAs(app: Application, email: string, password: string): Promise<AuthResult>;
export interface OrganizationData {
    id: string;
    name: string;
    ecosystem_type: string;
    settings: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
/**
 * Crea una organización vía API (no requiere auth).
 */
export declare function createTestOrganization(app: Application, body?: {
    name?: string;
    ecosystem_type?: 'terrestre' | 'maritimo' | 'mixto';
}): Promise<OrganizationData>;
/**
 * Bootstrap: solo añade membership (admin) a la organización vía BD, sin suscripción.
 * Útil para probar que los endpoints devuelven 403 cuando no hay suscripción activa.
 */
export declare function bootstrapOrganizationMembershipOnly(userId: UUID, organizationId: UUID): Promise<void>;
/**
 * Bootstrap: añade membership (admin) y suscripción activa a la organización vía BD.
 * Necesario porque las rutas que requieren organización exigen suscripción activa,
 * y no se puede invitar a nadie sin tener ya acceso (y por tanto suscripción).
 * Debe llamarse después de crear usuario (API) y organización (API).
 */
export declare function bootstrapOrganizationWithSubscription(userId: UUID, organizationId: UUID): Promise<void>;
export interface MembershipData {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Invita un usuario a la organización (requiere token con acceso admin y suscripción activa).
 */
export declare function createMembership(app: Application, accessToken: string, organizationId: string, body: {
    userId: string;
    role: 'admin' | 'gestor' | 'prestador' | 'observador';
    status?: string;
}): Promise<MembershipData>;
/**
 * Crea un perfil de prestador en la organización (requiere token admin y suscripción activa).
 */
export declare function createPrestadorProfile(app: Application, accessToken: string, organizationId: string, body: {
    userId: string;
    status?: string;
}): Promise<{
    id: string;
    userId: string;
    organizationId: string;
    status: string;
}>;
/**
 * Helper para peticiones autenticadas.
 */
export declare function authRequest(app: Application, accessToken: string): import("supertest/lib/agent")<request.SuperTestStatic.Test>;
//# sourceMappingURL=helpers.d.ts.map