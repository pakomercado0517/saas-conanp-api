# Tareas del Proyecto - Backend CONANP

## 📋 Setup Inicial y Configuración

### Infraestructura Base
- [ ] Configurar variables de entorno (.env) con todas las variables necesarias
- [ ] Configurar conexión a base de datos PostgreSQL
- [ ] Configurar Sequelize con migraciones y seeders
- [ ] Configurar estructura de carpetas según arquitectura modular
- [ ] Configurar TypeScript con configuraciones estrictas
- [ ] Configurar ESLint y Prettier
- [ ] Configurar nodemon para desarrollo
- [ ] Configurar scripts de package.json (dev, build, start, test)

### Dependencias Base
- [ ] Instalar y configurar Luxon para manejo de fechas
- [ ] Instalar y configurar Zod para validaciones
- [ ] Instalar y configurar Pino para logging
- [ ] Instalar y configurar express-rate-limit
- [ ] Instalar y configurar bcrypt para hash de contraseñas
- [ ] Instalar y configurar jsonwebtoken
- [ ] Instalar y configurar cors

### Shared/Infraestructura
- [ ] Crear configuración de base de datos (src/shared/database/)
- [ ] Crear clases de error personalizadas (src/shared/errors/)
- [ ] Crear tipos compartidos (src/shared/types/)
- [ ] Crear utilidades de fecha con Luxon (src/shared/utils/dates.ts)
- [ ] Crear helper de respuestas API (src/shared/utils/responses.ts)
- [ ] Crear middleware de manejo de errores global
- [ ] Crear middleware de validación de organización (multi-tenant)
- [ ] Configurar logger de Pino con contexto

---

## 🚀 Sprint 1: Autenticación y Organizaciones

### Módulo: Auth
- [ ] Crear modelo User (si no existe)
- [ ] Crear schema Zod para registro de usuario
- [ ] Crear schema Zod para login
- [ ] Crear service de autenticación (registro, login, refresh token)
- [ ] Crear controller de autenticación
- [ ] Crear rutas de autenticación (/api/v1/auth/register, /login, /refresh)
- [ ] Implementar hash de contraseñas con bcrypt
- [ ] Implementar generación de JWT (access y refresh tokens)
- [ ] Implementar middleware de autenticación JWT
- [ ] Validar tokens y extraer información del usuario
- [ ] Implementar rate limiting en endpoints de auth

### Módulo: Organizations
- [ ] Crear modelo Organization (si no existe)
- [ ] Crear schema Zod para crear organización
- [ ] Crear schema Zod para actualizar organización
- [ ] Crear service de organizaciones (CRUD)
- [ ] Crear controller de organizaciones
- [ ] Crear rutas de organizaciones (/api/v1/organizations)
- [ ] Implementar validación de acceso a organización
- [ ] Implementar filtros multi-tenant en queries

### Módulo: Users
- [ ] Completar modelo User si falta algo
- [ ] Crear schema Zod para actualizar usuario
- [ ] Crear service de usuarios (obtener, actualizar perfil)
- [ ] Crear controller de usuarios
- [ ] Crear rutas de usuarios (/api/v1/users)
- [ ] Implementar validación de permisos (usuario solo puede editar su perfil)

### Módulo: Membership
- [ ] Crear modelo Membership (si no existe)
- [ ] Crear schema Zod para crear membership
- [ ] Crear schema Zod para actualizar membership
- [ ] Crear service de memberships (invitar, actualizar rol, eliminar)
- [ ] Crear controller de memberships
- [ ] Crear rutas de memberships (/api/v1/organizations/:orgId/memberships)
- [ ] Implementar validación de roles (admin, prestador, etc.)
- [ ] Implementar validación de que solo admins pueden gestionar memberships

### Testing Sprint 1
- [ ] Tests unitarios de auth service
- [ ] Tests unitarios de organization service
- [ ] Tests de integración de endpoints de auth
- [ ] Tests de integración de endpoints de organizations

---

## 🎯 Sprint 2: Actividades, Prestadores y Permisos

### Módulo: Actividades
- [ ] Completar modelo Actividad si falta algo
- [ ] Crear schema Zod para crear actividad
- [ ] Crear schema Zod para actualizar actividad
- [ ] Crear schema Zod para listar actividades (con filtros)
- [ ] Crear service de actividades (CRUD completo)
- [ ] Implementar validación de tipo de agenda (BLOQUES vs HORARIO_LIBRE)
- [ ] Crear controller de actividades
- [ ] Crear rutas de actividades (/api/v1/actividades)
- [ ] Implementar paginación en listado
- [ ] Implementar filtros (tipo, agendaType, active)
- [ ] Validar que solo admins pueden crear/editar actividades

### Módulo: Prestadores
- [ ] Completar modelo PrestadorProfile si falta algo
- [ ] Crear schema Zod para crear perfil de prestador
- [ ] Crear schema Zod para actualizar perfil de prestador
- [ ] Crear service de prestadores (crear perfil, actualizar, obtener)
- [ ] Implementar validación de que usuario tenga membership en organización
- [ ] Crear controller de prestadores
- [ ] Crear rutas de prestadores (/api/v1/prestadores)
- [ ] Implementar validación de permisos (prestador solo puede ver/editar su perfil)

### Módulo: Permisos
- [ ] Completar modelo Permiso si falta algo
- [ ] Crear schema Zod para crear permiso
- [ ] Crear schema Zod para actualizar permiso
- [ ] Crear service de permisos (crear, actualizar, validar vigencia)
- [ ] Implementar validación de fechas de vigencia (validFrom, validTo)
- [ ] Crear función para verificar si permiso está vigente
- [ ] Crear controller de permisos
- [ ] Crear rutas de permisos (/api/v1/prestadores/:prestadorId/permisos)
- [ ] Implementar validación de que prestador tenga permiso vigente para actividad

### Testing Sprint 2
- [ ] Tests unitarios de actividad service
- [ ] Tests unitarios de prestador service
- [ ] Tests unitarios de permiso service
- [ ] Tests de integración de endpoints de actividades
- [ ] Tests de validación de tipo de agenda

---

## 🏗️ Sprint 3: Activos y Flujo de Aprobación

### Módulo: Activos
- [ ] Completar modelo Activo si falta algo
- [ ] Completar modelo ActivoRequisito si falta algo
- [ ] Crear schema Zod para crear activo
- [ ] Crear schema Zod para actualizar activo
- [ ] Crear schema Zod para crear requisito de activo
- [ ] Crear service de activos (CRUD completo)
- [ ] Implementar estados de activo (pendiente, aprobado, rechazado, suspendido)
- [ ] Implementar validación de transiciones de estado
- [ ] Crear service de requisitos de activo
- [ ] Crear controller de activos
- [ ] Crear rutas de activos (/api/v1/activos)
- [ ] Crear rutas de requisitos (/api/v1/activos/:activoId/requisitos)
- [ ] Implementar validación de que solo activos aprobados pueden usarse

### Flujo de Aprobación
- [ ] Crear service de aprobación de activos
- [ ] Implementar endpoint para aprobar activo (solo admins)
- [ ] Implementar endpoint para rechazar activo (solo admins)
- [ ] Implementar endpoint para suspender activo (solo admins)
- [ ] Crear schema Zod para comentarios de aprobación/rechazo
- [ ] Implementar notificaciones cuando activo cambia de estado
- [ ] Crear función para validar que activo esté aprobado antes de usar

### Testing Sprint 3
- [ ] Tests unitarios de activo service
- [ ] Tests de transiciones de estado de activos
- [ ] Tests de integración de flujo de aprobación
- [ ] Tests de validación de requisitos

---

## 📅 Sprint 4: Bloques, Capacidad y Eventos

### Módulo: Bloques
- [ ] Completar modelo Bloque si falta algo
- [ ] Crear schema Zod para crear bloque
- [ ] Crear schema Zod para crear bloque desde plantilla
- [ ] Crear schema Zod para actualizar bloque
- [ ] Crear service de bloques (CRUD, crear desde plantilla)
- [ ] Implementar validación de que bloque pertenezca a actividad con tipo BLOQUES
- [ ] Implementar validación de que horarios no se solapen
- [ ] Crear controller de bloques
- [ ] Crear rutas de bloques (/api/v1/actividades/:actividadId/bloques)
- [ ] Implementar funcionalidad de plantillas de bloques

### Módulo: Capacidad
- [ ] Completar modelo Capacidad si falta algo
- [ ] Crear schema Zod para crear/actualizar capacidad
- [ ] Crear service de capacidad (crear, actualizar, verificar disponibilidad)
- [ ] Implementar validación de capacidad por bloque (para BLOQUES)
- [ ] Implementar validación de capacidad por día (para HORARIO_LIBRE)
- [ ] Crear función para verificar si hay capacidad disponible
- [ ] Crear controller de capacidad
- [ ] Crear rutas de capacidad (/api/v1/actividades/:actividadId/capacidad)
- [ ] Implementar actualización automática de capacidad usada al crear evento

### Módulo: Eventos
- [ ] Completar modelo EventoOperativo si falta algo
- [ ] Crear schema Zod para crear evento (con validación según tipo de agenda)
- [ ] Crear schema Zod para actualizar evento
- [ ] Crear schema Zod para listar eventos (con filtros)
- [ ] Crear service de eventos (CRUD completo)
- [ ] Implementar validación de tipo de agenda (BLOQUES requiere bloqueId)
- [ ] Implementar validación de tipo de agenda (HORARIO_LIBRE requiere startTime/endTime)
- [ ] Implementar validación de que prestador tenga permiso vigente
- [ ] Implementar validación de que activos estén aprobados
- [ ] Implementar validación de capacidad disponible
- [ ] Implementar transacción para crear evento (evento + actualizar capacidad)
- [ ] Crear controller de eventos
- [ ] Crear rutas de eventos (/api/v1/eventos)
- [ ] Implementar paginación y filtros (fecha, actividad, prestador, estado)
- [ ] Implementar validación de permisos (prestador solo puede ver/editar sus eventos)

### Testing Sprint 4
- [ ] Tests unitarios de bloque service
- [ ] Tests unitarios de capacidad service
- [ ] Tests unitarios de evento service
- [ ] Tests de validación de tipo de agenda
- [ ] Tests de validación de capacidad
- [ ] Tests de transacciones en creación de eventos
- [ ] Tests de integración de endpoints de eventos

---

## 📸 Sprint 5: Evidencias y Reportes

### Módulo: Evidencias
- [ ] Completar modelo EvidenciaAmbiental si falta algo
- [ ] Crear schema Zod para crear evidencia
- [ ] Crear schema Zod para actualizar evidencia
- [ ] Crear service de evidencias (CRUD)
- [ ] Implementar subida de archivos (S3/R2)
- [ ] Implementar validación de tipos de archivo permitidos
- [ ] Implementar validación de tamaño máximo de archivo
- [ ] Crear controller de evidencias
- [ ] Crear rutas de evidencias (/api/v1/eventos/:eventoId/evidencias)
- [ ] Implementar generación de URLs firmadas para archivos
- [ ] Implementar eliminación de archivos cuando se elimina evidencia

### Reportes Básicos
- [ ] Crear service de reportes
- [ ] Implementar reporte de eventos por actividad
- [ ] Implementar reporte de eventos por prestador
- [ ] Implementar reporte de eventos por fecha/rango de fechas
- [ ] Implementar reporte de capacidad utilizada
- [ ] Implementar reporte de prestadores activos
- [ ] Crear controller de reportes
- [ ] Crear rutas de reportes (/api/v1/reportes)
- [ ] Implementar filtros y parámetros de reportes
- [ ] Implementar validación de permisos (solo admins pueden ver reportes)

### Testing Sprint 5
- [ ] Tests unitarios de evidencia service
- [ ] Tests de subida de archivos
- [ ] Tests unitarios de reportes
- [ ] Tests de integración de endpoints de evidencias

---

## 🔧 Mejoras y Optimizaciones

### Performance
- [ ] Revisar y optimizar queries con N+1
- [ ] Agregar índices faltantes en migraciones
- [ ] Implementar caché para configuraciones de organización
- [ ] Optimizar queries de reportes con agregaciones

### Seguridad
- [ ] Revisar y reforzar validaciones de permisos
- [ ] Implementar rate limiting en todos los endpoints públicos
- [ ] Revisar y validar todos los inputs con Zod
- [ ] Implementar validación de CORS en producción
- [ ] Revisar que no se expongan datos sensibles en logs

### Testing
- [ ] Aumentar cobertura de tests unitarios
- [ ] Agregar tests de integración para flujos críticos
- [ ] Implementar tests E2E para flujos principales
- [ ] Configurar CI/CD con ejecución de tests

### Documentación
- [ ] Documentar todos los endpoints (Swagger/OpenAPI)
- [ ] Documentar reglas de negocio complejas
- [ ] Crear guía de desarrollo para nuevos desarrolladores
- [ ] Documentar variables de entorno necesarias
- [ ] Crear diagramas de flujo de procesos principales

### DevOps
- [ ] Configurar Docker y docker-compose
- [ ] Configurar scripts de deployment
- [ ] Configurar monitoreo y alertas
- [ ] Configurar backups de base de datos
- [ ] Configurar variables de entorno en producción

---

## 📝 Notas para Notion

### Propiedades sugeridas para cada tarea:
- **Estado**: Por hacer / En progreso / En revisión / Completado
- **Sprint**: Sprint 1 / Sprint 2 / Sprint 3 / Sprint 4 / Sprint 5 / Mejoras
- **Prioridad**: Alta / Media / Baja
- **Tipo**: Backend / Testing / DevOps / Documentación
- **Estimación**: Tiempo estimado en horas
- **Asignado**: Persona responsable
- **Dependencias**: Tareas que deben completarse antes

### Vistas sugeridas:
- Vista por Sprint
- Vista por Estado
- Vista por Prioridad
- Vista Kanban
- Vista de Timeline (Gantt)

### Etiquetas sugeridas:
- `auth` - Autenticación
- `organizations` - Organizaciones
- `actividades` - Actividades
- `prestadores` - Prestadores
- `permisos` - Permisos
- `activos` - Activos
- `eventos` - Eventos
- `evidencias` - Evidencias
- `testing` - Testing
- `devops` - DevOps
- `documentación` - Documentación
