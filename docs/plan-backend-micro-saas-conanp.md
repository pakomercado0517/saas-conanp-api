
# Plan Backend Escalable — Micro-SaaS CONANP

Stack:
- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize ORM

---

## 1. Principios de diseño

1. Multi-tenant desde el inicio  
   - Todo pertenece a una organization  
   - Nunca asumir una sola ANP  

2. Dominio primero  
   - La lógica es operación turística regulada, no el framework  

3. Reglas como datos  
   - Nada hardcodeado por ecosistema  

4. Separación estricta  
   - Auth ≠ Dominio ≠ Infraestructura  

---

## 2. Arquitectura backend

```
src/
├─ modules/
│  ├─ auth/
│  ├─ organizations/
│  ├─ users/
│  ├─ prestadores/
│  ├─ actividades/
│  ├─ permisos/
│  ├─ activos/
│  ├─ eventos/
│  ├─ capacidad/
│  └─ evidencias/
│
├─ shared/
│  ├─ database/
│  ├─ middlewares/
│  ├─ utils/
│  ├─ errors/
│  └─ types/
│
├─ config/
├─ app.ts
└─ server.ts
```

Cada módulo contiene:
- model.ts
- service.ts
- controller.ts
- routes.ts

---

## 3. Modelo de datos (Sequelize + PostgreSQL)

### Organization
- id (UUID)
- name
- ecosystem_type
- settings (JSONB)

---

### User
- id
- email (unique)
- password
- name

---

### Membership
- userId
- organizationId
- role
- status

---

### PrestadorProfile
- userId
- organizationId
- status
- permitExpiresAt

---

### Actividad (CORE DEL SISTEMA)
Define qué actividad turística puede realizarse dentro de una ANP y **cómo se agenda**.

- organizationId
- name
- type (terrestre | maritima | mixta)
- agendaType (BLOQUES | HORARIO_LIBRE)
- requiresGuide
- impactLevel
- active

> **Nota clave:**  
> - BLOQUES → la operación se agenda seleccionando un bloque predefinido  
> - HORARIO_LIBRE → el prestador define hora inicio y fin al crear el evento  

---

### Permiso
- prestadorId
- actividadId
- validFrom
- validTo
- status
- documentUrl

---

### Activo
- organizationId
- ownerId
- type (embarcacion | vehiculo | guia | equipo)
- status (pendiente | aprobado | rechazado | suspendido)

---

### ActivoRequisito
- activoId
- key
- value
- documentUrl
- validated

---

### Bloque (solo para actividades con agendaType = BLOQUES)
- organizationId
- actividadId
- date (null si es plantilla)
- startTime
- endTime
- capacity
- isTemplate

---

### Capacidad
- organizationId
- actividadId
- date
- limit

> Para actividades con BLOQUES, la capacidad se valida por bloque.  
> Para HORARIO_LIBRE, la capacidad se valida por día o franja horaria.

---

### Evento Operativo
Registro de una operación turística concreta.

- organizationId
- prestadorId
- actividadId
- date
- bloqueId (obligatorio si agendaType = BLOQUES)
- startTime (obligatorio si agendaType = HORARIO_LIBRE)
- endTime (obligatorio si agendaType = HORARIO_LIBRE)
- peopleCount
- status

> **Regla de negocio crítica:**  
> La validación de agenda se realiza siempre en el backend, nunca solo en la UI.

---

### Evidencia Ambiental (opcional)
- eventoId
- type
- description
- fileUrl

---

## 4. Reglas de validación clave

- Si la actividad usa BLOQUES, el evento debe referenciar un bloque válido
- Si la actividad es HORARIO_LIBRE, el evento debe definir hora inicio y fin
- No se permite mezclar ambos esquemas
- Un evento no puede exceder la capacidad definida
- Activos no aprobados no pueden operar
- Prestadores sin permiso vigente no pueden crear eventos

---

## 5. Evitar cuellos de botella

### Antipatrones
- Lógica en controllers
- Queries sin índices
- Includes masivos
- Validaciones solo frontend

### Buenas prácticas
- Service layer fuerte
- Transacciones para operaciones críticas
- Índices por organizationId y fechas
- Filtros multi-tenant obligatorios

---

## 6. Herramientas recomendadas

- PostgreSQL + UUID
- JWT access/refresh
- Vitest para testing
- Docker desde el inicio
- Fly.io / Railway / Render
- Cloudflare R2 o S3 para archivos
- Winston o Pino para logs

---

## 7. Roadmap backend

### Sprint 1
- Auth
- Organization
- Membership
- User

### Sprint 2
- Actividades (con agendaType)
- Prestadores
- Permisos

### Sprint 3
- Activos
- Flujo de aprobación

### Sprint 4
- Bloques
- Capacidad
- Eventos

### Sprint 5
- Evidencia
- Reportes básicos

---

## Regla final

Si algo no depende del ecosistema → Core  
Si depende → Configuración

Este enfoque permite escalar la plataforma a cualquier ANP sin perder la lógica operativa específica.
