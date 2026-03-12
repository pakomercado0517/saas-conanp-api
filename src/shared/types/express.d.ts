import type { JWTPayload } from '@/modules/auth/types/auth.types.js';

/**
 * Extensión del tipo Request de Express para incluir propiedades de autenticación y multi-tenant
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Payload del JWT decodificado después de la autenticación
       */
      user?: JWTPayload;
      /**
       * ID del área del contexto multi-tenant (requireOrganizationAccess / requireAreaAccess).
       * Compatible con rutas que aún usan organizationId en path.
       */
      areaId?: string;
      /**
       * @deprecated Usar areaId. Se mantiene por compatibilidad con rutas organizations/:organizationId.
       */
      organizationId?: string;
      /**
       * ID de la dependencia cuando el middleware requireDependenciaAccess ha corrido.
       */
      dependenciaId?: string;
      /**
       * true when requireSuperAdmin middleware has validated the user (used by RLS middleware).
       */
      isSuperAdmin?: boolean;
      /**
       * Query params validados por middleware (ej. listar organizaciones)
       */
      validatedQuery?: unknown;
    }
  }
}

export {};
