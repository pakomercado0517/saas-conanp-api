/**
 * Genera cache keys estandarizadas con prefijos multi-tenant
 */
export const CacheKeys = {
  // Subscriptions
  activeSubscription: (organizationId: string) => `org:${organizationId}:subscription:active`,

  // Subscription Plans (catálogo global)
  subscriptionPlans: () => 'subscription-plans:active',
  subscriptionPlan: (planId: string) => `subscription-plan:${planId}`,

  // Actividades
  actividades: (organizationId: string) => `org:${organizationId}:actividades:active`,
  actividad: (organizationId: string, actividadId: string) =>
    `org:${organizationId}:actividad:${actividadId}`,

  // Organizations
  organization: (organizationId: string) => `org:${organizationId}`,
} as const;

/**
 * Genera patrones para invalidar múltiples keys
 */
export const CachePatterns = {
  // Todas las actividades de una organización
  allActividades: (organizationId: string) => `org:${organizationId}:actividad*`,

  // Todos los datos de una organización
  allOrganizationData: (organizationId: string) => `org:${organizationId}:*`,
} as const;
