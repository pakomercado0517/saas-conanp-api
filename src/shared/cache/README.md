# Sistema de Caché

Este módulo implementa un sistema de caché dual para optimizar el rendimiento de consultas frecuentes a la base de datos.

## Arquitectura

### Clientes de Caché

El sistema utiliza dos clientes de caché según el entorno:

- **Redis (Producción)**: Cliente `ioredis` para ambientes de producción y staging
- **Memory (Desarrollo/Tests)**: Cliente `node-cache` para desarrollo local y tests unitarios

El cliente se selecciona automáticamente según la configuración de variables de entorno.

## Configuración

### Variables de Entorno

```bash
# Habilitar/deshabilitar caché
CACHE_ENABLED=true

# URL de Redis (opcional - si no está, usa memoria)
REDIS_URL=redis://localhost:6379

# TTL por tipo de dato (en segundos)
CACHE_TTL_SUBSCRIPTION=600           # 10 minutos
CACHE_TTL_SUBSCRIPTION_PLAN=3600     # 1 hora
CACHE_TTL_ACTIVIDAD=1800             # 30 minutos
CACHE_TTL_ORGANIZATION=1800          # 30 minutos
```

### Inicialización

El caché se inicializa automáticamente al arrancar el servidor en [index.ts](../../index.ts):

```typescript
import { cache } from '@/shared/cache';

cache.initialize();
```

## Datos Cacheados

### 1. Suscripciones Activas (por organización)

- **Cache Key**: `org:${organizationId}:subscription:active`
- **TTL**: 10 minutos (600 segundos)
- **Consulta frecuencia**: ⭐⭐⭐⭐⭐ EXTREMA - En cada request protegido
- **Invalidación**:
  - Al crear suscripción
  - Al cambiar plan
  - Al cancelar/reactivar suscripción
  - En webhooks de Stripe (`subscription.updated`, `invoice.payment_*`)

**Servicio**: [organization.service.ts](../../modules/organizations/services/organization.service.ts)

```typescript
const subscription = await getSubscriptionByOrganization(organizationId);
// Ahora usa caché automáticamente
```

### 2. Planes de Suscripción (catálogo global)

- **Cache Keys**:
  - Lista completa: `subscription-plans:active`
  - Individual: `subscription-plan:${planId}`
- **TTL**: 1 hora (3600 segundos)
- **Consulta frecuencia**: ⭐⭐⭐⭐ MUY ALTA - Listado público, webhooks de Stripe
- **Invalidación**:
  - Al crear plan
  - Al actualizar plan
  - Al eliminar plan (soft delete)
  - Al sincronizar con Stripe

**Servicio**: [subscriptionPlan.service.ts](../../modules/subscriptions/services/subscription-plan.service.ts)

```typescript
const plan = await getPlanById(planId);
// Usa caché si está disponible
```

### 3. Actividades Activas (por organización)

- **Cache Keys**:
  - Lista completa: `org:${organizationId}:actividades:active`
  - Individual: `org:${organizationId}:actividad:${actividadId}`
- **TTL**: 30 minutos (1800 segundos)
- **Consulta frecuencia**: ⭐⭐⭐⭐ MUY ALTA - En formularios de permisos, eventos, capacidades
- **Invalidación**:
  - Al crear actividad
  - Al actualizar actividad
  - Al eliminar actividad (soft delete)

**Servicio**: [actividad.service.ts](../../modules/actividades/services/actividad.service.ts)

```typescript
const actividad = await getActividadById(actividadId, organizationId, userId);
// Usa caché con validación de acceso
```

### 4. Configuraciones de Organización

- **Cache Key**: `org:${organizationId}`
- **TTL**: 30 minutos (1800 segundos)
- **Consulta frecuencia**: ⭐⭐⭐ ALTA - Validación de membresía indirecta
- **Invalidación**:
  - Al actualizar organización
  - Al eliminar organización (soft delete)

## Uso en Código

### Obtener del Caché

```typescript
import { cache } from '@/shared/cache';
import { CacheKeys } from '@/shared/cache/keys';
import { cacheConfig } from '@/shared/cache/config';

const cacheKey = CacheKeys.organization(organizationId);
const cached = await cache.get<Organization>(cacheKey);

if (cached) {
  return cached;
}

// Consultar DB si no está en caché
const organization = await Organization.findByPk(organizationId);

// Guardar en caché
if (organization) {
  await cache.set(cacheKey, organization, cacheConfig.ttl.organization);
}
```

### Invalidar Caché

```typescript
import { cache } from '@/shared/cache';
import { CacheKeys } from '@/shared/cache/keys';

// Invalidar un solo registro
await cache.del(CacheKeys.organization(organizationId));

// Invalidar múltiples keys
await cache.del([CacheKeys.subscriptionPlans(), CacheKeys.subscriptionPlan(planId)]);
```

## Cache Keys (Multi-Tenant)

Todas las cache keys siguen un patrón estandarizado con prefijos multi-tenant:

```typescript
// Datos por organización
org:${organizationId}:subscription:active
org:${organizationId}:actividades:active
org:${organizationId}:actividad:${actividadId}
org:${organizationId}

// Datos globales (catálogos)
subscription-plans:active
subscription-plan:${planId}
```

Ver [keys.ts](./keys.ts) para la lista completa.

## Estrategia de Invalidación

### Proactiva

La invalidación se ejecuta inmediatamente después de operaciones de escritura (CREATE/UPDATE/DELETE):

```typescript
await subscription.update({ status: 'active' });

// Invalidar caché inmediatamente
await invalidateSubscriptionCache(organizationId);
```

### Reactiva (Webhooks de Stripe)

Los webhooks de Stripe que actualizan suscripciones también invalidan el caché:

- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Ver [subscription.service.ts](../../modules/subscriptions/services/subscription.service.ts)

### TTL como Backup

Todos los registros tienen un TTL configurado para evitar datos obsoletos si falla la invalidación:

- Suscripciones: 10 minutos (datos críticos, cambian frecuentemente)
- Planes: 1 hora (raramente cambian, consultados constantemente)
- Actividades: 30 minutos (moderadamente dinámicas)
- Organizaciones: 30 minutos (cambian poco)

## Middlewares Optimizados

Los siguientes middlewares se benefician automáticamente del caché:

### `requireOrganizationAccess`

```typescript
// Antes: 2 queries por request
// - Membership.findOne (verificar acceso)
// - Subscription.findOne + include SubscriptionPlan (verificar suscripción)

// Ahora: 1 query + 1 caché hit
// - Membership.findOne (verificar acceso)
// - getSubscriptionByOrganization -> CACHE HIT
```

### `attachSubscriptionLimits`

```typescript
// Antes: 4-5 queries por request de listado
// - Subscription.findOne + include SubscriptionPlan
// - Membership.count
// - EventoOperativo.count
// - Actividad.count

// Ahora: 3 queries + 1 caché hit
// - getSubscriptionByOrganization -> CACHE HIT
// - Membership.count
// - EventoOperativo.count
// - Actividad.count
```

## Testing

En tests, el caché usa el cliente de memoria (`node-cache`) por defecto.

### Limpiar Caché entre Tests

```typescript
import { cache } from '@/shared/cache';

beforeEach(async () => {
  await cache.flush();
});
```

### Deshabilitar Caché en Tests

```env
CACHE_ENABLED=false
```

## Monitoreo

El sistema de caché registra logs en nivel `debug` para operaciones de invalidación:

```typescript
logger.debug({ organizationId, cacheKey }, 'Caché de suscripción invalidado');
```

Para ver estos logs, configurar el nivel de log:

```env
LOG_LEVEL=debug
```

## Performance

### Beneficios Esperados

- **Reducción de queries a DB**: 30-50% en requests típicos
- **Latencia de middleware**: -20ms en promedio (evita query de suscripción)
- **Throughput**: +25% requests/segundo en endpoints de listado

### Trade-offs

- **Memoria**: ~50-100 MB de RAM para Redis (10k organizaciones activas)
- **Staleness**: Máximo 10 min para datos críticos, 1 hora para catálogos
- **Complejidad**: Invalidación distribuida requiere cuidado en webhooks

## Troubleshooting

### El caché no se invalida

1. Verificar que `CACHE_ENABLED=true`
2. Revisar logs de invalidación (`LOG_LEVEL=debug`)
3. Confirmar que la función de servicio llama a `invalidate*Cache()`

### Datos obsoletos después de webhook

1. Los webhooks de Stripe llaman a `invalidateSubscriptionCache()` en todas las actualizaciones
2. Si persiste, verificar que el webhook se está procesando correctamente
3. Revisar logs de `subscription.service.ts` para confirmar invalidación

### Redis no conecta

1. El sistema fallback a memoria automáticamente si Redis falla
2. Verificar `REDIS_URL` en `.env`
3. Revisar logs: `logger.error('Redis Client Error')`

---

**Última actualización**: febrero 2026  
**Mantenido por**: Equipo Backend CONANP
