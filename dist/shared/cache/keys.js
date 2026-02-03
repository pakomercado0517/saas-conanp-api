/**
 * Genera cache keys estandarizadas con prefijos multi-tenant
 */
export const CacheKeys = {
    // Subscriptions
    activeSubscription: (organizationId) => `org:${organizationId}:subscription:active`,
    // Subscription Plans (catálogo global)
    subscriptionPlans: () => 'subscription-plans:active',
    subscriptionPlan: (planId) => `subscription-plan:${planId}`,
    // Actividades
    actividades: (organizationId) => `org:${organizationId}:actividades:active`,
    actividad: (organizationId, actividadId) => `org:${organizationId}:actividad:${actividadId}`,
    // Organizations
    organization: (organizationId) => `org:${organizationId}`,
};
/**
 * Genera patrones para invalidar múltiples keys
 */
export const CachePatterns = {
    // Todas las actividades de una organización
    allActividades: (organizationId) => `org:${organizationId}:actividad*`,
    // Todos los datos de una organización
    allOrganizationData: (organizationId) => `org:${organizationId}:*`,
};
//# sourceMappingURL=keys.js.map