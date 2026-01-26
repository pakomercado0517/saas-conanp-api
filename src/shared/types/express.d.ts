import type { JWTPayload } from '@/modules/auth/types/auth.types.js';

/**
 * Extensión del tipo Request de Express para incluir propiedades de autenticación
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Payload del JWT decodificado después de la autenticación
       */
      user?: JWTPayload;
      /**
       * ID de la organización del contexto multi-tenant
       */
      organizationId?: string;
      /**
       * Query params validados por middleware (ej. listar organizaciones)
       */
      validatedQuery?: unknown;
    }
  }
}

export {};
