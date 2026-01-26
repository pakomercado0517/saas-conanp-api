# API de Autenticación

Documentación completa de los endpoints de autenticación del sistema CONANP.

**Base URL:** `/api/v1/auth`

---

## Tabla de Contenidos

- [POST /register](#post-register)
- [POST /login](#post-login)
- [POST /refresh](#post-refresh)
- [POST /logout](#post-logout)
- [GET /me](#get-me)
- [Manejo de Errores](#manejo-de-errores)
- [Validaciones](#validaciones)

---

## POST /register

Registra un nuevo usuario en el sistema.

### URL

```
POST /api/v1/auth/register
```

### Headers

```
Content-Type: application/json
```

### Rate Limiting

- **Producción:** 5 intentos por 15 minutos
- **Desarrollo:** Sin límite

### Body (JSON)

```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario"
}
```

### Validaciones

| Campo      | Tipo   | Requerido | Validaciones                                                                                       |
| ---------- | ------ | --------- | -------------------------------------------------------------------------------------------------- |
| `email`    | string | Sí        | - Formato de email válido<br>- Se convierte automáticamente a minúsculas<br>- Se recortan espacios |
| `password` | string | Sí        | - Mínimo 8 caracteres<br>- Máximo 255 caracteres                                                   |
| `name`     | string | Sí        | - Mínimo 1 carácter<br>- Máximo 255 caracteres<br>- Se recortan espacios                           |

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@example.com",
      "name": "Nombre Usuario"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
    "expiresIn": 900
  },
  "message": "Usuario registrado exitosamente",
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Campos de respuesta:**

- `user.id`: UUID del usuario creado
- `user.email`: Email del usuario (en minúsculas)
- `user.name`: Nombre del usuario
- `accessToken`: Token JWT para autenticación (expira en 15 minutos por defecto)
- `refreshToken`: Token para renovar el access token (expira en 7 días por defecto)
- `expiresIn`: Tiempo de expiración del access token en segundos

### Errores Posibles

#### 400 Bad Request - Error de Validación

```json
{
  "success": false,
  "error": "Error de validación",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "email",
      "mensaje": "El email debe tener un formato válido",
      "codigo": "invalid_string"
    },
    {
      "campo": "password",
      "mensaje": "La contraseña debe tener al menos 8 caracteres",
      "codigo": "too_small"
    }
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

#### 409 Conflict - Email ya registrado

```json
{
  "success": false,
  "error": "El email ya está registrado",
  "message": "El email ya está registrado",
  "code": "CONFLICT",
  "statusCode": 409,
  "details": {
    "email": "usuario@example.com"
  },
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

#### 429 Too Many Requests - Rate Limit Excedido

```json
{
  "message": "Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos."
}
```

---

## POST /login

Inicia sesión con email y contraseña.

### URL

```
POST /api/v1/auth/login
```

### Headers

```
Content-Type: application/json
```

### Rate Limiting

- **Producción:** 5 intentos por 15 minutos
- **Desarrollo:** Sin límite

### Body (JSON)

```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Validaciones

| Campo      | Tipo   | Requerido | Validaciones                                                                                       |
| ---------- | ------ | --------- | -------------------------------------------------------------------------------------------------- |
| `email`    | string | Sí        | - Formato de email válido<br>- Se convierte automáticamente a minúsculas<br>- Se recortan espacios |
| `password` | string | Sí        | - No puede estar vacío                                                                             |

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@example.com",
      "name": "Nombre Usuario"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
    "expiresIn": 900
  },
  "message": "Inicio de sesión exitoso",
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Campos de respuesta:**

- `user.id`: UUID del usuario
- `user.email`: Email del usuario
- `user.name`: Nombre del usuario
- `accessToken`: Token JWT para autenticación (expira en 15 minutos por defecto)
- `refreshToken`: Token para renovar el access token (expira en 7 días por defecto)
- `expiresIn`: Tiempo de expiración del access token en segundos

### Errores Posibles

#### 400 Bad Request - Error de Validación

```json
{
  "success": false,
  "error": "Error de validación",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "email",
      "mensaje": "El email es requerido y debe ser un texto",
      "codigo": "invalid_type"
    },
    {
      "campo": "password",
      "mensaje": "La contraseña no puede estar vacía",
      "codigo": "too_small"
    }
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

#### 401 Unauthorized - Credenciales Inválidas

```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "message": "Credenciales inválidas",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Nota:** Este error se retorna tanto si el email no existe como si la contraseña es incorrecta (por seguridad).

#### 429 Too Many Requests - Rate Limit Excedido

```json
{
  "message": "Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos."
}
```

---

## POST /refresh

Renueva un access token usando un refresh token válido.

### URL

```
POST /api/v1/auth/refresh
```

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### Validaciones

| Campo          | Tipo   | Requerido | Validaciones           |
| -------------- | ------ | --------- | ---------------------- |
| `refreshToken` | string | Sí        | - No puede estar vacío |

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "message": "Token renovado exitosamente",
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Campos de respuesta:**

- `accessToken`: Nuevo token JWT para autenticación (expira en 15 minutos por defecto)
- `expiresIn`: Tiempo de expiración del access token en segundos

**Nota:** El refresh token no se renueva. Se debe usar el mismo refresh token para renovar el access token hasta que expire o sea revocado.

### Errores Posibles

#### 400 Bad Request - Error de Validación

```json
{
  "success": false,
  "error": "Error de validación",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "refreshToken",
      "mensaje": "El refresh token es requerido y debe ser un texto",
      "codigo": "invalid_type"
    }
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

#### 401 Unauthorized - Refresh Token Inválido o Expirado

```json
{
  "success": false,
  "error": "Refresh token inválido o revocado",
  "message": "Refresh token inválido o revocado",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Posibles causas:**

- El refresh token no existe en la base de datos
- El refresh token fue revocado (logout)
- El refresh token está expirado

#### 401 Unauthorized - Refresh Token Expirado

```json
{
  "success": false,
  "error": "Refresh token expirado",
  "message": "Refresh token expirado",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

#### 401 Unauthorized - Usuario No Encontrado

```json
{
  "success": false,
  "error": "Usuario no encontrado",
  "message": "Usuario no encontrado",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

---

## POST /logout

Revoca un refresh token, cerrando la sesión del usuario.

### URL

```
POST /api/v1/auth/logout
```

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### Validaciones

| Campo          | Tipo   | Requerido | Validaciones           |
| -------------- | ------ | --------- | ---------------------- |
| `refreshToken` | string | Sí        | - No puede estar vacío |

### Respuesta Exitosa (204 No Content)

Sin cuerpo de respuesta. El refresh token ha sido revocado exitosamente.

**Nota:** Esta operación es idempotente. Si el refresh token ya estaba revocado o no existe, la operación se completa sin error.

### Errores Posibles

#### 400 Bad Request - Error de Validación

```json
{
  "success": false,
  "error": "Error de validación",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "refreshToken",
      "mensaje": "El refresh token no puede estar vacío",
      "codigo": "too_small"
    }
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

---

## GET /me

Obtiene información del usuario autenticado a partir del access token.

### URL

```
GET /api/v1/auth/me
```

### Headers

```
Authorization: Bearer <accessToken>
```

### Autenticación

**Requerida:** Sí (middleware `authenticate`)

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com"
  },
  "message": "Token válido",
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Campos de respuesta:**

- `userId`: UUID del usuario autenticado
- `email`: Email del usuario autenticado

### Errores Posibles

#### 401 Unauthorized - Token No Proporcionado

```json
{
  "success": false,
  "error": "Token de autenticación requerido",
  "message": "Token de autenticación requerido",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Causa:** El header `Authorization` no está presente o no tiene el formato correcto.

#### 401 Unauthorized - Token Inválido

```json
{
  "success": false,
  "error": "Token inválido",
  "message": "El token de autenticación no es válido",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Causa:** El token JWT no es válido (firma incorrecta, formato inválido, etc.).

#### 401 Unauthorized - Token Expirado

```json
{
  "success": false,
  "error": "Token expirado",
  "message": "El token de autenticación ha expirado. Por favor inicia sesión nuevamente",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Causa:** El access token ha expirado. Se debe usar el endpoint `/refresh` para obtener un nuevo access token.

#### 401 Unauthorized - Tipo de Token Inválido

```json
{
  "success": false,
  "error": "Tipo de token inválido",
  "message": "Tipo de token inválido",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Causa:** Se intentó usar un refresh token como access token (o viceversa).

---

## Manejo de Errores

Todos los endpoints de autenticación siguen una estructura consistente de manejo de errores.

### Estructura de Error Estándar

```json
{
  "success": false,
  "error": "Descripción breve del error",
  "message": "Mensaje detallado del error en español",
  "code": "CÓDIGO_DEL_ERROR",
  "statusCode": 400,
  "details": {},
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

### Códigos de Error Comunes

| Código                  | Descripción                             | Status Code |
| ----------------------- | --------------------------------------- | ----------- |
| `VALIDATION_ERROR`      | Error de validación de datos de entrada | 400         |
| `UNAUTHORIZED`          | Error de autenticación o autorización   | 401         |
| `CONFLICT`              | Conflicto (ej: email duplicado)         | 409         |
| `TOO_MANY_REQUESTS`     | Rate limit excedido                     | 429         |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor              | 500         |

### Errores de Validación (Zod)

Cuando hay errores de validación, se retorna un array `detalles` con información específica de cada campo:

```json
{
  "success": false,
  "error": "Error de validación",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "email",
      "mensaje": "El email debe tener un formato válido",
      "codigo": "invalid_string"
    }
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Campos del detalle:**

- `campo`: Ruta del campo con error (ej: "email", "password", "user.name")
- `mensaje`: Mensaje de error en español
- `codigo`: Código del error de Zod

### Errores de Autenticación

Los errores de autenticación siempre retornan código `UNAUTHORIZED` (401) y no exponen detalles técnicos en producción:

```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "message": "Credenciales inválidas",
  "code": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

**Nota:** Por seguridad, no se diferencia entre "email no existe" y "contraseña incorrecta".

---

## Validaciones

### Validaciones de Registro

#### Email

- **Tipo:** string
- **Requerido:** Sí
- **Formato:** Email válido (RFC 5322)
- **Transformaciones:**
  - Convertido automáticamente a minúsculas
  - Espacios recortados al inicio y final

#### Password

- **Tipo:** string
- **Requerido:** Sí
- **Longitud mínima:** 8 caracteres
- **Longitud máxima:** 255 caracteres

#### Name

- **Tipo:** string
- **Requerido:** Sí
- **Longitud mínima:** 1 carácter
- **Longitud máxima:** 255 caracteres
- **Transformaciones:**
  - Espacios recortados al inicio y final

### Validaciones de Login

#### Email

- **Tipo:** string
- **Requerido:** Sí
- **Formato:** Email válido (RFC 5322)
- **Transformaciones:**
  - Convertido automáticamente a minúsculas
  - Espacios recortados al inicio y final

#### Password

- **Tipo:** string
- **Requerido:** Sí
- **Longitud mínima:** 1 carácter (no vacío)

### Validaciones de Refresh Token

#### RefreshToken

- **Tipo:** string
- **Requerido:** Sí
- **Longitud mínima:** 1 carácter (no vacío)

### Validaciones de Autenticación JWT

#### Header Authorization

- **Formato requerido:** `Bearer <token>`
- **Validaciones:**
  - El header debe existir
  - Debe comenzar con "Bearer "
  - El token no puede estar vacío

#### Access Token

- **Formato:** JWT (JSON Web Token)
- **Validaciones:**
  - Firma válida con `JWT_SECRET`
  - No expirado
  - Tipo de token: `access` (no refresh token)
  - Estructura válida del payload

---

## Objetos de Respuesta

### AuthResponse (Register/Login)

```typescript
{
  user: {
    id: string; // UUID del usuario
    email: string; // Email del usuario
    name: string; // Nombre del usuario
  }
  accessToken: string; // JWT access token
  refreshToken: string; // Refresh token (hex string)
  expiresIn: number; // Segundos hasta expiración del access token
}
```

### RefreshTokenResponse (Refresh)

```typescript
{
  accessToken: string; // Nuevo JWT access token
  expiresIn: number; // Segundos hasta expiración del access token
}
```

### UserInfoResponse (Me)

```typescript
{
  userId: string; // UUID del usuario
  email: string; // Email del usuario
}
```

### SuccessResponse (Wrapper)

Todas las respuestas exitosas siguen este formato:

```typescript
{
  success: true;
  data: T;              // Datos específicos del endpoint
  message?: string;     // Mensaje opcional en español
  timestamp: string;    // ISO 8601 timestamp
}
```

### ErrorResponse (Wrapper)

Todas las respuestas de error siguen este formato:

```typescript
{
  success: false;
  error: string;        // Descripción breve del error
  message: string;      // Mensaje detallado en español
  code: string;         // Código del error
  statusCode: number;   // Código HTTP
  details?: object;     // Detalles adicionales (opcional)
  detalles?: Array<{     // Array de errores de validación (opcional)
    campo: string;
    mensaje: string;
    codigo: string;
  }>;
  timestamp: string;    // ISO 8601 timestamp
}
```

---

## Configuración de Tokens

Los tiempos de expiración de los tokens se configuran mediante variables de entorno:

- **`JWT_ACCESS_EXPIRES_IN`**: Tiempo de expiración del access token
  - **Default:** `15m` (15 minutos)
  - **Formato:** Número seguido de unidad (`s`, `m`, `h`, `d`)
  - **Ejemplos:** `15m`, `1h`, `30s`, `7d`

- **`JWT_REFRESH_EXPIRES_IN`**: Tiempo de expiración del refresh token
  - **Default:** `7d` (7 días)
  - **Formato:** Número seguido de unidad (`s`, `m`, `h`, `d`)
  - **Ejemplos:** `7d`, `30d`, `14d`

- **`JWT_SECRET`**: Secreto para firmar tokens JWT
  - **Requerido:** Sí
  - **Recomendación:** String aleatorio y seguro (mínimo 32 caracteres)

---

## Ejemplos de Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123",
    "name": "Juan Pérez"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
  }'
```

### Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
  }'
```

### Obtener Información del Usuario

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notas de Seguridad

1. **Rate Limiting:** Los endpoints `/register` y `/login` tienen rate limiting en producción (5 intentos / 15 minutos) para prevenir ataques de fuerza bruta.

2. **Hash de Contraseñas:** Todas las contraseñas se hashean con bcrypt (10 rounds mínimo) antes de guardarse en la base de datos.

3. **Refresh Tokens Hasheados:** Los refresh tokens se hashean con bcrypt antes de guardarse en la base de datos.

4. **Mensajes de Error Genéricos:** Por seguridad, no se diferencia entre "email no existe" y "contraseña incorrecta" en el endpoint de login.

5. **Tokens JWT:** Los access tokens son JWT firmados con `JWT_SECRET`. No almacenan información sensible.

6. **HTTPS:** Se recomienda usar HTTPS en producción para proteger los tokens en tránsito.

---

## Flujo de Autenticación Recomendado

1. **Registro/Login:** El usuario se registra o inicia sesión y recibe `accessToken` y `refreshToken`.

2. **Uso del Access Token:** El cliente usa el `accessToken` en el header `Authorization: Bearer <token>` para acceder a endpoints protegidos.

3. **Renovación:** Cuando el `accessToken` expira (401), el cliente usa el endpoint `/refresh` con el `refreshToken` para obtener un nuevo `accessToken`.

4. **Logout:** El cliente llama a `/logout` con el `refreshToken` para revocarlo y cerrar la sesión.

5. **Múltiples Dispositivos:** Cada login genera un nuevo `refreshToken`, permitiendo múltiples sesiones simultáneas. Cada dispositivo debe gestionar su propio par de tokens.
