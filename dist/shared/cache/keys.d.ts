/**
 * Genera cache keys estandarizadas con prefijos multi-tenant
 */
export declare const CacheKeys: {
    readonly activeSubscription: (organizationId: string) => string;
    readonly subscriptionPlans: () => string;
    readonly subscriptionPlan: (planId: string) => string;
    readonly actividades: (organizationId: string) => string;
    readonly actividad: (organizationId: string, actividadId: string) => string;
    readonly organization: (organizationId: string) => string;
};
/**
 * Genera patrones para invalidar múltiples keys
 */
export declare const CachePatterns: {
    readonly allActividades: (organizationId: string) => string;
    readonly allOrganizationData: (organizationId: string) => string;
};
//# sourceMappingURL=keys.d.ts.map