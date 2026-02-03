/**
 * Loader de documentación Swagger
 *
 * Este archivo importa todos los módulos de documentación para registrar
 * sus rutas y schemas en el registry de OpenAPI antes de generar la especificación.
 */
// Importar documentación de todos los módulos
import '../../modules/auth/swagger/auth.swagger.js';
import '../../modules/users/swagger/user.swagger.js';
import '../../modules/users/swagger/membership.swagger.js';
import '../../modules/organizations/swagger/organization.swagger.js';
// TODO: Importar documentación de otros módulos aquí cuando se creen
// import '../../modules/actividades/swagger/actividad.swagger.js';
// etc...
//# sourceMappingURL=loader.js.map