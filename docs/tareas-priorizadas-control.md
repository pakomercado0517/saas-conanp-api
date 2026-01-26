# Tareas Priorizadas - Backend CONANP

> **Última actualización**: 25 de enero de 2026  
> **Estado general**: En progreso - Sprint 1 pendiente

## 📊 Resumen de Estado Actual

### ✅ Completado

- ✅ Modelos de Sequelize (todos los módulos)
- ✅ Infraestructura compartida (database, errors, logger, middleware, dates)
- ✅ Configuración base del servidor (Express, CORS, rate limiting, error handling)
- ✅ Migraciones de base de datos

### ❌ Pendiente

- ❌ Services (0/9 módulos)
- ❌ Controllers (0/9 módulos)
- ❌ Validators (0/9 módulos)
- ❌ Routes (0/9 módulos)
- ❌ Middleware de autenticación
- ❌ Middleware de autorización
- ❌ Middleware multi-tenant
- ❌ Tests

---

## 🎯 Prioridad 1: Sprint 1 — Autenticación y Base Multi-Tenant (FUNDAMENTAL)

> **Bloquea todo lo demás** - Debe completarse primero

### 1.1 Módulo Auth (CRÍTICO - Bloquea todo lo demás)

- [x] Crear schemas Zod para registro y login (`validators/auth.validator.ts`)
  - [x] Schema para registro de usuario
  - [x] Schema para login
  - [x] Schema para refresh token
- [x] Crear service de autenticación (`services/auth.service.ts`)
  - [x] Función de registro de usuarios
  - [x] Función de login con JWT (access + refresh tokens)
  - [x] Función de refresh token
  - [x] Función de validación de tokens
  - [x] Hash de contraseñas con bcrypt
- [x] Crear controller de autenticación (`controllers/auth.controller.ts`)
  - [x] Endpoint de registro
  - [x] Endpoint de login
  - [x] Endpoint de refresh token
- [x] Crear rutas de autenticación (`routes/auth.routes.ts`)
  - [x] POST `/api/v1/auth/register`
  - [x] POST `/api/v1/auth/login`
  - [x] POST `/api/v1/auth/refresh`
- [x] Crear middleware de autenticación JWT (`middleware/authenticate.ts`)
  - [x] Validar token JWT
  - [x] Extraer información del usuario del token
  - [x] Agregar usuario al request
- [x] Integrar rutas en `server.ts`

**Notas**: Este módulo es crítico porque sin autenticación no se pueden proteger endpoints ni validar acceso a organizaciones.

---

### 1.2 Módulo Organizations (Base Multi-Tenant)

- [x] Crear schemas Zod para organizaciones (`validators/organization.validator.ts`)
  - [x] Schema para crear organización
  - [x] Schema para actualizar organización
  - [x] Schema para listar organizaciones (con filtros)
- [x] Crear service de organizaciones (`services/organization.service.ts`)
  - [x] Función para crear organización
  - [x] Función para obtener organización por ID
  - [x] Función para listar organizaciones
  - [x] Función para actualizar organización
  - [x] Función para eliminar organización (soft delete)
  - [x] Validación de acceso a organización
  - [x] Filtros multi-tenant obligatorios
- [x] Crear controller de organizaciones (`controllers/organization.controller.ts`)
  - [x] Endpoint para crear
  - [x] Endpoint para listar
  - [x] Endpoint para obtener por ID
  - [x] Endpoint para actualizar
  - [x] Endpoint para eliminar
- [x] Crear rutas de organizaciones (`routes/organization.routes.ts`)
  - [x] POST `/api/v1/organizations`
  - [x] GET `/api/v1/organizations`
  - [x] GET `/api/v1/organizations/:id`
  - [x] PATCH `/api/v1/organizations/:id`
  - [x] DELETE `/api/v1/organizations/:id`
- [x] Crear middleware multi-tenant (`middleware/organization-access.ts`)
  - [x] Validar que usuario pertenezca a organización
  - [x] Extraer organizationId del request
  - [x] Agregar organizationId al request
- [x] Integrar rutas en `server.ts`

**Notas**: Base del sistema multi-tenant. Todo debe filtrarse por `organizationId`.

---

### 1.3 Módulo Users

- [x] Crear schemas Zod para usuarios (`validators/user.validator.ts`)
  - [x] Schema para actualizar perfil de usuario
  - [x] Schema para cambiar contraseña
- [x] Crear service de usuarios (`services/user.service.ts`)
  - [x] Función para obtener perfil del usuario actual
  - [x] Función para actualizar perfil
  - [x] Función para cambiar contraseña
  - [x] Función para cambiar eliminar
  - [x] Validación de permisos (usuario solo puede editar su perfil)
- [x] Crear controller de usuarios (`controllers/user.controller.ts`)
  - [x] Endpoint para obtener perfil
  - [x] Endpoint para actualizar perfil
  - [x] Endpoint para cambiar contraseña
  - [x] Endpoint para cambiar eliminar perfil
- [x] Crear rutas de usuarios (`routes/user.routes.ts`)
  - [x] GET `/api/v1/users/me`
  - [x] PATCH `/api/v1/users/me`
  - [x] PATCH `/api/v1/users/me/password`
  - [x] DELETE `/api/v1/users/profile`
- [x] Integrar rutas en `server.ts`

---

### 1.4 Módulo Membership

- [x] Crear schemas Zod para memberships (`validators/membership.validator.ts`)
  - [x] Schema para crear/invitar membership
  - [x] Schema para actualizar membership (rol)
  - [x] Schema para listar memberships
- [x] Crear service de memberships (`services/membership.service.ts`)
  - [x] Función para invitar usuario a organización
  - [x] Función para actualizar rol de membership
  - [x] Función para eliminar membership
  - [x] Función para listar memberships de una organización
  - [x] Validación de roles (admin, prestador, etc.)
  - [x] Validación de que solo admins pueden gestionar memberships
- [x] Crear controller de memberships (`controllers/membership.controller.ts`)
  - [x] Endpoint para invitar
  - [x] Endpoint para listar
  - [x] Endpoint para actualizar rol
  - [x] Endpoint para eliminar
- [x] Crear rutas de memberships (`routes/membership.routes.ts`)
  - [x] POST `/api/v1/organizations/:orgId/memberships`
  - [x] GET `/api/v1/organizations/:orgId/memberships`
  - [x] PATCH `/api/v1/organizations/:orgId/memberships/:membershipId`
  - [x] DELETE `/api/v1/organizations/:orgId/memberships/:membershipId`
- [x] Crear middleware de autorización por roles (`middleware/authorize.ts`)
  - [x] Validar rol del usuario
  - [x] Verificar permisos según rol
- [x] Integrar rutas en `server.ts`

**Notas**: Necesario para gestionar quién puede hacer qué en cada organización.

---

## 🎯 Prioridad 2: Sprint 2 — Actividades, Prestadores y Permisos

### 2.1 Módulo Actividades

- [x] Crear schemas Zod (`validators/actividad.validator.ts`)
  - [x] Schema para crear actividad
  - [x] Schema para actualizar actividad
  - [x] Schema para listar actividades (con filtros)
  - [x] Validar `agendaType` (BLOQUES | HORARIO_LIBRE)
- [x] Crear service de actividades (`services/actividad.service.ts`)
  - [x] Función para crear actividad
  - [x] Función para obtener actividad por ID
  - [x] Función para listar actividades (con paginación)
  - [x] Función para actualizar actividad
  - [x] Función para eliminar actividad (soft delete)
  - [x] Validación de tipo de agenda
  - [x] Filtros multi-tenant obligatorios
  - [x] Validar que solo admins pueden crear/editar actividades
- [x] Crear controller de actividades (`controllers/actividad.controller.ts`)
  - [x] Endpoint para crear
  - [x] Endpoint para obtener por ID
  - [x] Endpoint para listar
  - [x] Endpoint para actualizar
  - [x] Endpoint para eliminar
- [x] Crear rutas de actividades (`routes/actividad.routes.ts`)
  - [x] POST `/api/v1/actividades`
  - [x] GET `/api/v1/actividades`
  - [x] GET `/api/v1/actividades/:id`
  - [x] PATCH `/api/v1/actividades/:id`
  - [x] DELETE `/api/v1/actividades/:id`
- [x] Integrar rutas en `server.ts`

**Notas**: Define qué actividades turísticas pueden realizarse y cómo se agendan (BLOQUES vs HORARIO_LIBRE).

---

### 2.2 Módulo Prestadores

- [x] Crear schemas Zod (`validators/prestador.validator.ts`)
  - [x] Schema para crear perfil de prestador
  - [x] Schema para actualizar perfil de prestador
  - [x] Schema para listar prestadores
- [x] Crear service de prestadores (`services/prestador.service.ts`)
  - [x] Función para crear perfil de prestador
  - [x] Función para obtener perfil por ID
  - [x] Función para listar prestadores
  - [x] Función para actualizar perfil
  - [x] Validar que usuario tenga membership en organización
  - [x] Validación de permisos (prestador solo puede ver/editar su perfil)
- [x] Crear controller de prestadores (`controllers/prestador.controller.ts`)
  - [x] Endpoint para crear
  - [x] Endpoint para obtener por ID
  - [x] Endpoint para listar
  - [x] Endpoint para actualizar
- [x] Crear rutas de prestadores (`routes/prestador.routes.ts`)
  - [x] POST `/api/v1/prestadores`
  - [x] GET `/api/v1/prestadores`
  - [x] GET `/api/v1/prestadores/:id`
  - [x] PATCH `/api/v1/prestadores/:id`
- [x] Integrar rutas en `server.ts`

---

### 2.3 Módulo Permisos

- [x] Crear schemas Zod (`validators/permiso.validator.ts`)
  - [x] Schema para crear permiso
  - [x] Schema para actualizar permiso
  - [x] Schema para listar permisos
  - [x] Validar fechas de vigencia (validFrom, validTo)
- [x] Crear service de permisos (`services/permiso.service.ts`)
  - [x] Función para crear permiso
  - [x] Función para obtener permiso por ID
  - [x] Función para listar permisos de un prestador
  - [x] Función para actualizar permiso
  - [x] Función para verificar si permiso está vigente
  - [x] Validación de fechas de vigencia
  - [x] Validar que prestador tenga permiso vigente para actividad
- [x] Crear controller de permisos (`controllers/permiso.controller.ts`)
  - [x] Endpoint para crear
  - [x] Endpoint para obtener por ID
  - [x] Endpoint para listar
  - [x] Endpoint para actualizar
- [x] Crear rutas de permisos (`routes/permiso.routes.ts`)
  - [x] POST `/api/v1/prestadores/:prestadorId/permisos`
  - [x] GET `/api/v1/prestadores/:prestadorId/permisos`
  - [x] GET `/api/v1/prestadores/:prestadorId/permisos/:permisoId`
  - [x] PATCH `/api/v1/prestadores/:prestadorId/permisos/:permisoId`
- [x] Integrar rutas en `server.ts`

**Notas**: Autoriza a prestadores para realizar actividades específicas con fechas de vigencia.

---

## 🎯 Prioridad 3: Sprint 3 — Activos y Flujo de Aprobación

### 3.1 Módulo Activos

- [ ] Crear schemas Zod (`validators/activo.validator.ts`)
  - [ ] Schema para crear activo
  - [ ] Schema para actualizar activo
  - [ ] Schema para listar activos
  - [ ] Schema para crear requisito de activo
- [ ] Crear service de activos (`services/activo.service.ts`)
  - [ ] Función para crear activo
  - [ ] Función para obtener activo por ID
  - [ ] Función para listar activos
  - [ ] Función para actualizar activo
  - [ ] Función para eliminar activo (soft delete)
  - [ ] Implementar estados de activo (pendiente, aprobado, rechazado, suspendido)
  - [ ] Validar transiciones de estado
  - [ ] Validar que solo activos aprobados puedan usarse
- [ ] Crear service de requisitos de activo (`services/activo-requisito.service.ts`)
  - [ ] Función para crear requisito
  - [ ] Función para listar requisitos de un activo
  - [ ] Función para actualizar requisito
  - [ ] Función para eliminar requisito
- [ ] Crear controller de activos (`controllers/activo.controller.ts`)
  - [ ] Endpoint para crear
  - [ ] Endpoint para obtener por ID
  - [ ] Endpoint para listar
  - [ ] Endpoint para actualizar
  - [ ] Endpoint para eliminar
- [ ] Crear controller de requisitos (`controllers/activo-requisito.controller.ts`)
  - [ ] Endpoint para crear requisito
  - [ ] Endpoint para listar requisitos
  - [ ] Endpoint para actualizar requisito
  - [ ] Endpoint para eliminar requisito
- [ ] Crear rutas de activos (`routes/activo.routes.ts`)
  - [ ] POST `/api/v1/activos`
  - [ ] GET `/api/v1/activos`
  - [ ] GET `/api/v1/activos/:id`
  - [ ] PATCH `/api/v1/activos/:id`
  - [ ] DELETE `/api/v1/activos/:id`
- [ ] Crear rutas de requisitos (`routes/activo-requisito.routes.ts`)
  - [ ] POST `/api/v1/activos/:activoId/requisitos`
  - [ ] GET `/api/v1/activos/:activoId/requisitos`
  - [ ] PATCH `/api/v1/activos/:activoId/requisitos/:requisitoId`
  - [ ] DELETE `/api/v1/activos/:activoId/requisitos/:requisitoId`
- [ ] Crear endpoints de aprobación (solo admins)
  - [ ] POST `/api/v1/activos/:id/aprobar`
  - [ ] POST `/api/v1/activos/:id/rechazar`
  - [ ] POST `/api/v1/activos/:id/suspender`
- [ ] Integrar rutas en `server.ts`

**Notas**: Recursos del prestador (embarcaciones, vehículos, guías, equipos) que deben ser aprobados antes de usarse.

---

## 🎯 Prioridad 4: Sprint 4 — Bloques, Capacidad y Eventos (CORE DEL NEGOCIO)

### 4.1 Módulo Bloques

- [ ] Crear schemas Zod (`validators/bloque.validator.ts`)
  - [ ] Schema para crear bloque
  - [ ] Schema para crear bloque desde plantilla
  - [ ] Schema para actualizar bloque
  - [ ] Schema para listar bloques
- [ ] Crear service de bloques (`services/bloque.service.ts`)
  - [ ] Función para crear bloque
  - [ ] Función para crear bloque desde plantilla
  - [ ] Función para obtener bloque por ID
  - [ ] Función para listar bloques de una actividad
  - [ ] Función para actualizar bloque
  - [ ] Función para eliminar bloque
  - [ ] Validar que bloque pertenezca a actividad con tipo BLOQUES
  - [ ] Validar que horarios no se solapen
  - [ ] Funcionalidad de plantillas de bloques
- [ ] Crear controller de bloques (`controllers/bloque.controller.ts`)
  - [ ] Endpoint para crear
  - [ ] Endpoint para crear desde plantilla
  - [ ] Endpoint para obtener por ID
  - [ ] Endpoint para listar
  - [ ] Endpoint para actualizar
  - [ ] Endpoint para eliminar
- [ ] Crear rutas de bloques (`routes/bloque.routes.ts`)
  - [ ] POST `/api/v1/actividades/:actividadId/bloques`
  - [ ] POST `/api/v1/actividades/:actividadId/bloques/from-template`
  - [ ] GET `/api/v1/actividades/:actividadId/bloques`
  - [ ] GET `/api/v1/actividades/:actividadId/bloques/:id`
  - [ ] PATCH `/api/v1/actividades/:actividadId/bloques/:id`
  - [ ] DELETE `/api/v1/actividades/:actividadId/bloques/:id`
- [ ] Integrar rutas en `server.ts`

**Notas**: Solo para actividades con `agendaType = BLOQUES`. Horarios predefinidos que el prestador selecciona.

---

### 4.2 Módulo Capacidad

- [ ] Crear schemas Zod (`validators/capacidad.validator.ts`)
  - [ ] Schema para crear/actualizar capacidad
  - [ ] Schema para verificar disponibilidad
- [ ] Crear service de capacidad (`services/capacidad.service.ts`)
  - [ ] Función para crear capacidad
  - [ ] Función para actualizar capacidad
  - [ ] Función para verificar disponibilidad por bloque (para BLOQUES)
  - [ ] Función para verificar disponibilidad por día (para HORARIO_LIBRE)
  - [ ] Función para actualizar capacidad usada automáticamente
- [ ] Crear controller de capacidad (`controllers/capacidad.controller.ts`)
  - [ ] Endpoint para crear/actualizar
  - [ ] Endpoint para verificar disponibilidad
- [ ] Crear rutas de capacidad (`routes/capacidad.routes.ts`)
  - [ ] POST `/api/v1/actividades/:actividadId/capacidad`
  - [ ] GET `/api/v1/actividades/:actividadId/capacidad/verificar`
- [ ] Integrar rutas en `server.ts`

**Notas**: Controla límites de personas/operaciones permitidas. Diferente lógica según tipo de agenda.

---

### 4.3 Módulo Eventos (CRÍTICO - Lógica de Negocio Principal)

- [ ] Crear schemas Zod (`validators/evento.validator.ts`)
  - [ ] Schema para crear evento (con validación condicional según tipo de agenda)
  - [ ] Schema para actualizar evento
  - [ ] Schema para listar eventos (con filtros)
- [ ] Crear service de eventos (`services/evento.service.ts`)
  - [ ] Función para crear evento
  - [ ] Función para obtener evento por ID
  - [ ] Función para listar eventos (con paginación)
  - [ ] Función para actualizar evento
  - [ ] Función para eliminar evento (soft delete)
  - [ ] **Validar tipo de agenda** (BLOQUES requiere bloqueId, HORARIO_LIBRE requiere startTime/endTime)
  - [ ] **Validar que prestador tenga permiso vigente**
  - [ ] **Validar que activos estén aprobados**
  - [ ] **Validar capacidad disponible**
  - [ ] **Transacción para crear evento** (evento + actualizar capacidad)
  - [ ] Paginación y filtros (fecha, actividad, prestador, estado)
  - [ ] Validación de permisos (prestador solo puede ver/editar sus eventos)
- [ ] Crear controller de eventos (`controllers/evento.controller.ts`)
  - [ ] Endpoint para crear
  - [ ] Endpoint para obtener por ID
  - [ ] Endpoint para listar
  - [ ] Endpoint para actualizar
  - [ ] Endpoint para eliminar
- [ ] Crear rutas de eventos (`routes/evento.routes.ts`)
  - [ ] POST `/api/v1/eventos`
  - [ ] GET `/api/v1/eventos`
  - [ ] GET `/api/v1/eventos/:id`
  - [ ] PATCH `/api/v1/eventos/:id`
  - [ ] DELETE `/api/v1/eventos/:id`
- [ ] Integrar rutas en `server.ts`

**Notas**: **CORE DEL SISTEMA**. Registro de operaciones turísticas concretas. Requiere todas las validaciones de negocio.

---

## 🎯 Prioridad 5: Sprint 5 — Evidencias y Reportes

### 5.1 Módulo Evidencias

- [ ] Crear schemas Zod (`validators/evidencia.validator.ts`)
  - [ ] Schema para crear evidencia
  - [ ] Schema para actualizar evidencia
  - [ ] Schema para listar evidencias
- [ ] Configurar subida de archivos (S3/R2 o similar)
  - [ ] Configurar cliente de almacenamiento
  - [ ] Configurar variables de entorno
- [ ] Crear service de evidencias (`services/evidencia.service.ts`)
  - [ ] Función para crear evidencia
  - [ ] Función para obtener evidencia por ID
  - [ ] Función para listar evidencias de un evento
  - [ ] Función para actualizar evidencia
  - [ ] Función para eliminar evidencia
  - [ ] Validación de tipos de archivo permitidos
  - [ ] Validación de tamaño máximo de archivo
  - [ ] Generación de URLs firmadas para archivos
  - [ ] Eliminación de archivos cuando se elimina evidencia
- [ ] Crear controller de evidencias (`controllers/evidencia.controller.ts`)
  - [ ] Endpoint para crear (con upload de archivo)
  - [ ] Endpoint para obtener por ID
  - [ ] Endpoint para listar
  - [ ] Endpoint para actualizar
  - [ ] Endpoint para eliminar
- [ ] Crear rutas de evidencias (`routes/evidencia.routes.ts`)
  - [ ] POST `/api/v1/eventos/:eventoId/evidencias`
  - [ ] GET `/api/v1/eventos/:eventoId/evidencias`
  - [ ] GET `/api/v1/eventos/:eventoId/evidencias/:id`
  - [ ] PATCH `/api/v1/eventos/:eventoId/evidencias/:id`
  - [ ] DELETE `/api/v1/eventos/:eventoId/evidencias/:id`
- [ ] Integrar rutas en `server.ts`

---

### 5.2 Módulo Reportes

- [ ] Crear service de reportes (`services/reporte.service.ts`)
  - [ ] Función para reporte de eventos por actividad
  - [ ] Función para reporte de eventos por prestador
  - [ ] Función para reporte de eventos por fecha/rango de fechas
  - [ ] Función para reporte de capacidad utilizada
  - [ ] Función para reporte de prestadores activos
- [ ] Crear controller de reportes (`controllers/reporte.controller.ts`)
  - [ ] Endpoint para eventos por actividad
  - [ ] Endpoint para eventos por prestador
  - [ ] Endpoint para eventos por fecha
  - [ ] Endpoint para capacidad utilizada
  - [ ] Endpoint para prestadores activos
- [ ] Crear rutas de reportes (`routes/reporte.routes.ts`)
  - [ ] GET `/api/v1/reportes/eventos/por-actividad`
  - [ ] GET `/api/v1/reportes/eventos/por-prestador`
  - [ ] GET `/api/v1/reportes/eventos/por-fecha`
  - [ ] GET `/api/v1/reportes/capacidad-utilizada`
  - [ ] GET `/api/v1/reportes/prestadores-activos`
- [ ] Validar permisos (solo admins pueden ver reportes)
- [ ] Implementar filtros y parámetros de reportes
- [ ] Integrar rutas en `server.ts`

---

## 🔧 Prioridad 6: Mejoras y Optimizaciones

### 6.1 Testing

- [ ] Configurar Vitest
  - [ ] Configurar archivo de configuración
  - [ ] Configurar scripts en package.json
  - [ ] Configurar entorno de testing
- [ ] Tests unitarios de services críticos
  - [ ] Tests de auth service
  - [ ] Tests de evento service (lógica de negocio principal)
  - [ ] Tests de capacidad service
  - [ ] Tests de permiso service
- [ ] Tests de integración de endpoints principales
  - [ ] Tests de endpoints de auth
  - [ ] Tests de endpoints de eventos
  - [ ] Tests de endpoints de actividades
- [ ] Tests E2E de flujos críticos
  - [ ] Flujo completo de creación de evento
  - [ ] Flujo de aprobación de activo
  - [ ] Flujo de registro y login

---

### 6.2 Performance

- [ ] Revisar y optimizar queries
  - [ ] Identificar queries N+1
  - [ ] Optimizar con includes estratégicos
  - [ ] Usar findAndCountAll para paginación
- [ ] Agregar índices faltantes en migraciones
  - [ ] Índices en organizationId
  - [ ] Índices en campos de fecha
  - [ ] Índices compuestos (organizationId + date)
- [ ] Implementar caché para configuraciones
  - [ ] Caché de configuraciones de organización
  - [ ] Caché de actividades activas
- [ ] Optimizar queries de reportes con agregaciones

---

### 6.3 Seguridad

- [ ] Revisar validaciones de permisos
  - [ ] Auditar todos los endpoints
  - [ ] Verificar validación multi-tenant
  - [ ] Verificar validación de roles
- [ ] Reforzar rate limiting
  - [ ] Rate limiting específico por endpoint
  - [ ] Rate limiting por organización
- [ ] Validar CORS en producción
  - [ ] Configurar orígenes permitidos
  - [ ] Validar headers
- [ ] Revisar exposición de datos en logs
  - [ ] No loggear contraseñas
  - [ ] No loggear tokens completos
  - [ ] Sanitizar datos sensibles

---

### 6.4 Documentación

- [ ] Documentar endpoints (Swagger/OpenAPI)
  - [ ] Configurar Swagger/OpenAPI
  - [ ] Documentar todos los endpoints
  - [ ] Documentar schemas de request/response
- [ ] Documentar reglas de negocio complejas
  - [ ] Validación de tipo de agenda
  - [ ] Flujo de aprobación de activos
  - [ ] Validación de capacidad
- [ ] Crear guía de desarrollo
  - [ ] Estructura del proyecto
  - [ ] Convenciones de código
  - [ ] Cómo agregar un nuevo módulo
- [ ] Documentar variables de entorno necesarias
- [ ] Crear diagramas de flujo de procesos principales

---

## 📝 Notas Generales

### Dependencias Críticas

1. **Sprint 1 (Auth)** → Bloquea todo lo demás
2. **Sprint 1 (Organizations)** → Base multi-tenant, necesario para todo
3. **Sprint 4 (Eventos)** → Depende de: Actividades, Prestadores, Permisos, Activos, Bloques, Capacidad
4. **Sprint 5 (Evidencias)** → Depende de: Eventos

### Reglas de Negocio Críticas a Implementar

1. **Validación de tipo de agenda**:
   - Si `agendaType = BLOQUES` → evento debe tener `bloqueId`
   - Si `agendaType = HORARIO_LIBRE` → evento debe tener `startTime` y `endTime`

2. **Validación de capacidad**:
   - Para BLOQUES: validar capacidad del bloque específico
   - Para HORARIO_LIBRE: validar capacidad del día o franja horaria

3. **Validación de permisos**:
   - Prestador debe tener permiso vigente para la actividad
   - Activos deben estar aprobados

4. **Multi-tenant obligatorio**:
   - Todos los queries deben filtrar por `organizationId`
   - Validar acceso a organización antes de cualquier operación

### Convenciones a Seguir

- **Models**: PascalCase (ej: `Actividad`, `PrestadorProfile`)
- **Services**: camelCase con sufijo `Service` (ej: `actividadService`)
- **Controllers**: camelCase con sufijo `Controller`
- **Routes**: kebab-case en URLs (ej: `/api/v1/actividades`)
- **Types**: PascalCase (ej: `CreateActividadDTO`)
- **Schemas Zod**: PascalCase con sufijo `Schema`

---

## 📊 Métricas de Progreso

### Por Sprint

- **Sprint 1**: 0/4 módulos completos (0%)
- **Sprint 2**: 0/3 módulos completos (0%)
- **Sprint 3**: 0/1 módulos completos (0%)
- **Sprint 4**: 0/3 módulos completos (0%)
- **Sprint 5**: 0/2 módulos completos (0%)
- **Mejoras**: 0/4 áreas completas (0%)

### Total General

- **Módulos completos**: 0/13 (0%)
- **Tareas completadas**: 0/XXX (0%)

---

**Última actualización**: 25 de enero de 2026
