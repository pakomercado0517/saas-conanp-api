import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

/**
 * Configuración base de OpenAPI para la documentación de la API
 */
export const registry = new OpenAPIRegistry();

/**
 * Definición de seguridad JWT para OpenAPI
 */
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Token JWT obtenido del endpoint /api/v1/auth/login o /api/v1/auth/register',
});

/**
 * Generador de especificación OpenAPI 3.0
 */
export const generator = new OpenApiGeneratorV3(registry.definitions);

/**
 * Configuración base de la API
 */
export const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'CONANP - API de Gestión de Áreas Naturales Protegidas',
    version: '1.0.0',
    description: `
API REST para la gestión y regulación de operaciones turísticas en Áreas Naturales Protegidas (ANP) de México.

## Características
- Sistema multi-tenant (cada ANP es una organización independiente)
- Gestión de prestadores de servicios turísticos y sus permisos
- Control de capacidad de actividades turísticas
- Registro de eventos operativos con evidencias ambientales
- Sistema de suscripciones con Stripe

## Autenticación
La mayoría de los endpoints requieren autenticación mediante JWT (JSON Web Token).
1. Registra un usuario o inicia sesión en \`/api/v1/auth/register\` o \`/api/v1/auth/login\`
2. Usa el \`accessToken\` recibido en el header \`Authorization: Bearer <token>\`
3. Cuando el token expire, usa el \`refreshToken\` en \`/api/v1/auth/refresh\` para obtener uno nuevo

## Organización Multi-Tenant
- Cada ANP es una organización (\`organizationId\`)
- Los usuarios pertenecen a organizaciones mediante memberships
- Todos los datos están aislados por organización
- Requiere suscripción activa para acceder a funcionalidades
    `.trim(),
    contact: {
      name: 'Equipo CONANP',
      email: 'soporte@conanp.gob.mx',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Servidor de desarrollo local',
    },
    {
      url: 'https://api-staging.conanp.gob.mx',
      description: 'Servidor de staging',
    },
    {
      url: 'https://api.conanp.gob.mx',
      description: 'Servidor de producción',
    },
  ],
  tags: [
    {
      name: 'Autenticación',
      description: 'Endpoints de registro, login, logout y gestión de tokens',
    },
    {
      name: 'Usuarios',
      description: 'Gestión de perfil de usuario y configuración personal',
    },
    {
      name: 'Organizaciones',
      description: 'Gestión de ANPs (Áreas Naturales Protegidas)',
    },
    {
      name: 'Memberships',
      description: 'Gestión de membresías de usuarios en organizaciones',
    },
    {
      name: 'Actividades',
      description: 'Gestión de actividades turísticas permitidas en ANPs',
    },
    {
      name: 'Bloques',
      description: 'Gestión de bloques horarios para actividades',
    },
    {
      name: 'Capacidad',
      description: 'Gestión de capacidad de actividades y disponibilidad',
    },
    {
      name: 'Prestadores',
      description: 'Gestión de perfiles de prestadores de servicios turísticos',
    },
    {
      name: 'Permisos',
      description: 'Gestión de permisos de prestadores para realizar actividades',
    },
    {
      name: 'Activos',
      description: 'Gestión de activos de prestadores (embarcaciones, vehículos, guías, equipos)',
    },
    {
      name: 'Eventos Operativos',
      description: 'Registro de operaciones turísticas concretas realizadas',
    },
    {
      name: 'Evidencias Ambientales',
      description: 'Gestión de evidencias ambientales asociadas a eventos',
    },
    {
      name: 'Reportes',
      description: 'Generación de reportes y estadísticas',
    },
    {
      name: 'Pagos',
      description: 'Gestión de pagos y transacciones con Stripe',
    },
    {
      name: 'Planes de Suscripción',
      description: 'Gestión de planes de suscripción disponibles',
    },
    {
      name: 'Suscripciones',
      description: 'Gestión de suscripciones de organizaciones',
    },
    {
      name: 'Webhooks',
      description: 'Webhooks de Stripe para eventos de pagos',
    },
  ],
};
