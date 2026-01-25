# Backend CONANP - Sistema de Gestión de Áreas Naturales Protegidas

Sistema multi-tenant (Micro-SaaS) para la gestión y regulación de operaciones turísticas en **Áreas Naturales Protegidas (ANP)** de México. La plataforma permite a diferentes ANPs gestionar prestadores de servicios turísticos, sus permisos, activos, actividades turísticas y eventos operativos.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Características Principales](#-características-principales)
- [Desarrollo](#-desarrollo)
- [Documentación](#-documentación)

## 🎯 Descripción

Este backend proporciona una API RESTful para gestionar operaciones turísticas dentro de Áreas Naturales Protegidas. El sistema permite:

- **Regulación**: Controlar y regular las operaciones turísticas dentro de ANPs
- **Gestión de Prestadores**: Administrar prestadores de servicios turísticos y sus permisos
- **Control de Capacidad**: Gestionar la capacidad de actividades turísticas (por bloques o horario libre)
- **Trazabilidad**: Registrar eventos operativos con evidencias ambientales
- **Multi-tenant**: Cada ANP es una organización independiente con sus propias reglas

### Conceptos Clave

- **ANP (Área Natural Protegida)**: Representada como `Organization` en el sistema
- **Prestador**: Usuario que ofrece servicios turísticos dentro de una ANP
- **Actividad**: Actividad turística que puede realizarse (Snorkel, Kayak, Senderismo, etc.)
- **Permiso**: Autorización con fechas de vigencia para realizar una actividad
- **Activo**: Recurso del prestador (embarcación, vehículo, guía, equipo)
- **Evento Operativo**: Registro de una operación turística concreta
- **Bloque**: Horario predefinido para actividades con tipo BLOQUES
- **Capacidad**: Límite de personas/operaciones permitidas

## 🛠 Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Lenguaje**: TypeScript (strict mode)
- **Base de Datos**: PostgreSQL
- **ORM**: Sequelize 6.x
- **Validación**: Zod 4.x
- **Fechas**: Luxon 3.x
- **Autenticación**: JWT (jsonwebtoken)
- **Logging**: Pino + pino-http
- **Seguridad**: bcrypt, express-rate-limit
- **Package Manager**: pnpm 10.x

## 📦 Requisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- pnpm >= 10.x

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)

```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

4. **Configurar la base de datos**

Asegúrate de que PostgreSQL esté corriendo y actualiza la configuración en `.env` y `config/config.cjs`.

5. **Ejecutar migraciones**

```bash
pnpm db:migrate
```

6. **Ejecutar seeds** (opcional)

```bash
pnpm db:seed:all
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
NODE_ENV=development
PORT=3001

# Base de Datos
DATABASE_PUBLIC_URL=postgresql://usuario:password@localhost:5432/conanp_db

# JWT
JWT_SECRET=tu-secreto-jwt-super-seguro
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3001

# Logging
LOG_LEVEL=info
```

### Configuración de Base de Datos

La configuración de Sequelize se encuentra en `config/config.cjs`. Asegúrate de que coincida con tus credenciales de PostgreSQL.

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo (con hot-reload)
pnpm dev

# Compilar TypeScript
pnpm build

# Iniciar servidor en producción
pnpm start

# Ejecutar linter
pnpm lint
```

### Base de Datos

```bash
# Ejecutar migraciones
pnpm db:migrate

# Revertir última migración
pnpm db:migrate:undo

# Ver estado de migraciones
pnpm db:migrate:status

# Ejecutar seeds
pnpm db:seed:all

# Revertir seeds
pnpm db:seed:undo

# Ver estado de seeds
pnpm db:seed:status
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── index.ts                 # Punto de entrada
│   ├── server.ts                # Configuración de Express
│   ├── modules/                 # Módulos del dominio
│   │   ├── auth/               # Autenticación
│   │   ├── organizations/      # Organizaciones (ANPs)
│   │   ├── users/              # Usuarios
│   │   ├── prestadores/        # Prestadores de servicios
│   │   ├── actividades/        # Actividades turísticas
│   │   ├── permisos/           # Permisos
│   │   ├── activos/            # Activos (embarcaciones, vehículos, etc.)
│   │   ├── eventos/            # Eventos operativos
│   │   ├── capacidad/          # Control de capacidad
│   │   └── evidencias/         # Evidencias ambientales
│   └── shared/                 # Código compartido
│       ├── database/           # Configuración de BD
│       ├── errors/             # Clases de error personalizadas
│       ├── logger/             # Configuración de logging
│       ├── middleware/         # Middlewares globales
│       └── dates/              # Utilidades de fechas (Luxon)
├── database/
│   ├── migrations/             # Migraciones de Sequelize
│   └── seeders/                # Seeds de Sequelize
├── config/
│   └── config.cjs              # Configuración de Sequelize
├── docs/                       # Documentación
├── dist/                       # Código compilado (generado)
└── package.json
```

## ✨ Características Principales

### 🏗 Arquitectura

- **Multi-tenant**: Todo filtrado por `organizationId`
- **Modular**: Cada dominio en su propio módulo
- **Service Layer**: Toda lógica de negocio en services, controllers delgados
- **Separación estricta**: Auth ≠ Dominio ≠ Infraestructura

### 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Hash de contraseñas con bcrypt
- Rate limiting en endpoints críticos
- Validación de entrada con Zod
- Manejo seguro de errores (sin exponer detalles en producción)

### 📅 Manejo de Fechas

- **Luxon** para todas las operaciones de fechas
- Zona horaria de aplicación: `America/Mexico_City`
- Zona horaria de BD: `UTC`
- Conversión automática entre zonas horarias
- Utilidades para validación, formateo y cálculos

### ✅ Validación

- **Zod** para validación de esquemas
- Mensajes de error en español
- Validación en backend (nunca confiar solo en frontend)
- Schemas reutilizables para fechas y tipos comunes

### 📝 Logging

- **Pino** para logging estructurado
- Diferentes niveles según entorno
- Contexto completo en logs (userId, organizationId, IP, etc.)
- Formato legible en desarrollo, JSON en producción

### 🚨 Manejo de Errores

- Middleware global de manejo de errores
- Clases de error personalizadas (ValidationError, NotFoundError, etc.)
- Formateo automático de errores de Zod, Sequelize y JWT
- Respuestas consistentes en español
- Logging estructurado de errores

## 💻 Desarrollo

### Principios Fundamentales

1. **Multi-tenant desde el inicio**: Todo pertenece a una organización
2. **Dominio primero**: La lógica es operación turística regulada
3. **Reglas como datos**: Nada hardcodeado por ecosistema
4. **Validaciones backend**: Nunca confiar solo en frontend
5. **Mensajes en español**: Siempre para buena UX
6. **Simplicidad**: Evitar sobre-ingeniería

### Convenciones

- **Models**: PascalCase (ej: `Actividad`, `PrestadorProfile`)
- **Services**: camelCase con sufijo `Service` (ej: `actividadService`)
- **Controllers**: camelCase con sufijo `Controller`
- **Routes**: kebab-case en URLs (ej: `/api/actividades`)
- **Types**: PascalCase (ej: `CreateActividadDTO`)
- **Schemas Zod**: PascalCase con sufijo `Schema`

### Estructura de Módulos

Cada módulo sigue esta estructura:

```
modules/[nombre-modulo]/
├── models/          # Modelos de Sequelize
├── services/        # Lógica de negocio
├── controllers/     # Controladores (delgados)
├── routes/          # Rutas de Express
├── validators/      # Schemas Zod
└── types/           # Tipos TypeScript
```

### Ejemplo de Uso

#### Crear un endpoint

```typescript
// validators/actividad.validator.ts
import { z } from 'zod';

export const CreateActividadSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  organizationId: z.string().uuid(),
  agendaType: z.enum(['BLOQUES', 'HORARIO_LIBRE']),
});

export type CreateActividadDTO = z.infer<typeof CreateActividadSchema>;

// services/actividad.service.ts
import { NotFoundError } from '@/shared/errors';

export const createActividad = async (data: CreateActividadDTO) => {
  // Lógica de negocio aquí
  const actividad = await Actividad.create(data);
  return actividad;
};

// controllers/actividad.controller.ts
export const createActividad = async (req: Request, res: Response) => {
  const data = req.body;
  const actividad = await actividadService.create(data);
  res.status(201).json(actividad);
};
```

#### Manejo de Fechas

```typescript
import { now, parseDate, formatForAPI, toUTC } from '@/shared/dates';

// Obtener fecha actual
const fechaActual = now();

// Parsear fecha del frontend
const fecha = parseDate(req.body.date);

// Formatear para respuesta
const fechaFormateada = formatForAPI(fecha);

// Convertir a UTC para guardar en BD
const fechaUTC = toUTC(fecha);
```

#### Lanzar Errores

```typescript
import { NotFoundError, ValidationError } from '@/shared/errors';

// Error de recurso no encontrado
if (!actividad) {
  throw new NotFoundError('Actividad');
}

// Error de validación
if (!permisoVigente) {
  throw new ValidationError('No tienes un permiso vigente para esta actividad');
}
```

## 📚 Documentación

- **Plan técnico completo**: `docs/plan-backend-micro-saas-conanp.md`
- **Tareas del proyecto**: `docs/tareas-proyecto-notion.md`
- **Reglas de trabajo**: `.cursorrules`

## 🔗 Endpoints Principales

### Health Check

```
GET /health
```

Retorna el estado del servidor, timestamp y uptime.

### Estructura de Respuestas

#### Respuesta Exitosa

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2026-01-24T10:30:00-06:00"
}
```

#### Respuesta de Error

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "El campo es requerido",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email"
  }
}
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
pnpm test
```

## 📄 Licencia

ISC

## 👥 Contribución

1. Crear una rama para la feature (`git checkout -b feature/nueva-feature`)
2. Commitear los cambios (`git commit -m 'Agregar nueva feature'`)
3. Push a la rama (`git push origin feature/nueva-feature`)
4. Abrir un Pull Request

---

**Desarrollado para CONANP - Gestión de Áreas Naturales Protegidas**
