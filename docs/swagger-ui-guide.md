# Documentación Swagger UI - CONANP API

## ✅ Implementación Completada

Se ha implementado exitosamente **Swagger UI** para documentar la API de CONANP usando `@asteasolutions/zod-to-openapi`.

### URL de Acceso
- **Desarrollo Local**: http://localhost:3001/api-docs
- **Documentación Interactiva**: Interfaz Swagger UI completa para probar endpoints

---

## 📁 Estructura Creada

```
src/
├── shared/
│   └── swagger/
│       ├── config.ts          # Configuración OpenAPI base (info, servers, tags, security)
│       ├── schemas.ts         # Schemas comunes (errores, paginación)
│       ├── loader.ts          # Carga todos los módulos de documentación
│       └── index.ts           # Punto de entrada y generador de spec
│
├── modules/
│   └── auth/
│       ├── validators/
│       │   └── auth.validator.ts      # ✅ Mejorado con .describe() y .openapi()
│       └── swagger/
│           └── auth.swagger.ts        # ✅ Documentación completa del módulo Auth
│
└── server.ts                          # ✅ Integración de Swagger UI en /api-docs
```

---

## ✅ Módulos Documentados

### 1. **Autenticación** (Auth) - ✅ COMPLETADO

Endpoints documentados:
- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar access token
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

**Características incluidas:**
- Schemas de request con validaciones y ejemplos
- Schemas de response con estructura de éxito/error
- Ejemplos de payloads (máximo 2 por endpoint)
- Descripciones en español
- Códigos de error documentados (400, 401, 500)
- Autenticación JWT documentada

---

## ⏳ Módulos Pendientes de Documentación

Los siguientes módulos **requieren documentación** (archivos `swagger/*.swagger.ts`):

### Prioridad Alta
1. **Organizations** - Gestión de ANPs
2. **Users** - Gestión de perfil de usuario
3. **Actividades** - Actividades turísticas
4. **Eventos Operativos** - Registro de operaciones turísticas
5. **Prestadores** - Perfiles de prestadores

### Prioridad Media
6. **Permisos** - Permisos de prestadores para actividades
7. **Activos** - Embarcaciones, vehículos, guías, equipos
8. **Bloques** - Bloques horarios para actividades
9. **Capacidad** - Capacidad y disponibilidad de actividades

### Prioridad Baja
10. **Evidencias Ambientales** - Evidencias de eventos
11. **Reportes** - Reportes y estadísticas
12. **Pagos** - Integración con Stripe
13. **Suscripciones** - Gestión de suscripciones
14. **Planes de Suscripción** - Planes disponibles
15. **Webhooks** - Webhooks de Stripe

---

## 📝 Cómo Documentar un Nuevo Módulo

### Paso 1: Mejorar schemas Zod (opcional pero recomendado)

Edita el archivo `validators/*.validator.ts` del módulo:

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);

export const CreateExampleSchema = registry.register(
  'CreateExampleRequest',
  z.object({
    name: z
      .string()
      .min(1)
      .max(255)
      .describe('Nombre del elemento')
      .openapi({ example: 'Mi Ejemplo' }),
    // ... más campos con .describe() y .openapi()
  })
);
```

### Paso 2: Crear archivo de documentación

Crea `modules/[modulo]/swagger/[modulo].swagger.ts`:

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry, commonErrorResponses } from '@/shared/swagger/index.js';
import { CreateExampleSchema } from '../validators/example.validator.js';

extendZodWithOpenApi(z);

// Definir schemas de respuesta
const ExampleResponseSchema = registry.register(
  'ExampleResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      id: z.string().uuid().describe('ID del elemento'),
      name: z.string().describe('Nombre del elemento'),
      // ... más campos
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

// Registrar endpoints
registry.registerPath({
  method: 'post',
  path: '/api/v1/examples',
  tags: ['Examples'],
  summary: 'Crear nuevo ejemplo',
  description: 'Descripción detallada del endpoint',
  security: [{ bearerAuth: [] }], // Si requiere auth
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateExampleSchema,
          examples: {
            example1: {
              summary: 'Ejemplo básico',
              value: {
                name: 'Mi Ejemplo',
              },
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Elemento creado exitosamente',
      content: {
        'application/json': {
          schema: ExampleResponseSchema,
          examples: {
            success: {
              summary: 'Creación exitosa',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  name: 'Mi Ejemplo',
                },
                message: 'Elemento creado exitosamente',
                timestamp: '2026-02-03T12:00:00.000Z',
              },
            },
          },
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});
```

### Paso 3: Importar en el loader

Edita `src/shared/swagger/loader.ts`:

```typescript
import '../../modules/auth/swagger/auth.swagger.js';
import '../../modules/[modulo]/swagger/[modulo].swagger.js'; // ← Agregar esta línea
```

### Paso 4: Verificar

```bash
pnpm build      # Compilar
pnpm dev        # Iniciar servidor
```

Visita `http://localhost:3001/api-docs` y verifica que aparezca tu nuevo módulo.

---

## 🎯 Configuración Actual

### Información de la API
- **Título**: CONANP - API de Gestión de Áreas Naturales Protegidas
- **Versión**: 1.0.0
- **Descripción**: Sistema multi-tenant para regulación de operaciones turísticas en ANPs

### Servidores
- **Desarrollo**: http://localhost:5000
- **Staging**: https://api-staging.conanp.gob.mx
- **Producción**: https://api.conanp.gob.mx

### Seguridad
- **Tipo**: Bearer Token (JWT)
- **Formato**: `Authorization: Bearer <accessToken>`

### Tags Definidos
1. Autenticación ✅
2. Usuarios
3. Organizaciones
4. Memberships
5. Actividades
6. Bloques
7. Capacidad
8. Prestadores
9. Permisos
10. Activos
11. Eventos Operativos
12. Evidencias Ambientales
13. Reportes
14. Pagos
15. Planes de Suscripción
16. Suscripciones
17. Webhooks

---

## 🚀 Próximos Pasos

1. ✅ Documentar módulo Auth - **COMPLETADO**
2. ⏳ Documentar módulo Organizations
3. ⏳ Documentar módulo Users
4. ⏳ Documentar módulo Actividades
5. ⏳ Documentar resto de módulos según prioridad

---

## 📚 Recursos

- **Swagger UI**: http://localhost:3001/api-docs (en desarrollo)
- **Biblioteca**: [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)
- **OpenAPI 3.0**: [Especificación oficial](https://swagger.io/specification/)
- **Zod**: [Documentación oficial](https://zod.dev)

---

## 🔧 Comandos Útiles

```bash
# Compilar proyecto
pnpm build

# Iniciar servidor de desarrollo
pnpm dev

# Ver documentación Swagger
# Abrir http://localhost:3001/api-docs en el navegador
```

---

## ✨ Características Implementadas

- ✅ Integración completa de Swagger UI
- ✅ Generación automática desde schemas Zod
- ✅ Autenticación JWT documentada
- ✅ Errores comunes reutilizables (400, 401, 403, 404, 500)
- ✅ Schemas de paginación
- ✅ Ejemplos de request/response
- ✅ Descripciones en español
- ✅ Nivel de detalle medio
- ✅ Máximo 2 ejemplos por endpoint
- ✅ Estructura modular y escalable

---

## 📊 Progreso de Documentación

**Módulos Documentados**: 1 / 16 (6.25%)

| Módulo | Estado | Endpoints |
|--------|--------|-----------|
| Auth | ✅ | 5/5 |
| Organizations | ⏳ | 0/? |
| Users | ⏳ | 0/? |
| Actividades | ⏳ | 0/? |
| Bloques | ⏳ | 0/? |
| Capacidad | ⏳ | 0/? |
| Prestadores | ⏳ | 0/? |
| Permisos | ⏳ | 0/? |
| Activos | ⏳ | 0/? |
| Eventos | ⏳ | 0/? |
| Evidencias | ⏳ | 0/? |
| Reportes | ⏳ | 0/? |
| Pagos | ⏳ | 0/? |
| Subscriptions | ⏳ | 0/? |
| Plans | ⏳ | 0/? |
| Webhooks | ⏳ | 0/? |

---

**Última actualización**: 3 de febrero de 2026
