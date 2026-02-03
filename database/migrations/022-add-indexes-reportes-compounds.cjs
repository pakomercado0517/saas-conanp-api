'use strict';

/**
 * Índices compuestos para reportes y consultas multi-tenant.
 * Ver docs/indices-database-audit.md para la auditoría completa.
 *
 * - capacidades: organizationId + date (reporte capacidad utilizada)
 * - eventos_operativos: organizationId + date + status (reportes con filtro status)
 * - eventos_operativos: actividadId + date + bloqueId (agregación SUM/GROUP BY)
 * - permisos: prestadorId + status (reporte prestadores activos)
 * - bloques: organizationId + actividadId (carga de bloques por org en reportes)
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // capacidades: reporte capacidad utilizada filtra por organizationId y rango date
    await queryInterface.addIndex('capacidades', ['organizationId', 'date'], {
      name: 'idx_capacidades_org_date',
      comment: 'Reporte capacidad utilizada: filtro org + fecha',
    });

    // eventos_operativos: reportes filtran por org + rango fecha + status IN ('programado','en_curso')
    await queryInterface.addIndex('eventos_operativos', ['organizationId', 'date', 'status'], {
      name: 'idx_eventos_operativos_org_date_status',
      comment: 'Reportes: filtro org + fecha + status',
    });

    // eventos_operativos: agregación SUM(peopleCount) GROUP BY actividadId, date, bloqueId
    await queryInterface.addIndex('eventos_operativos', ['actividadId', 'date', 'bloqueId'], {
      name: 'idx_eventos_operativos_actividad_date_bloque',
      comment: 'Reporte capacidad: agregación por actividad/fecha/bloque',
    });

    // permisos: reporte prestadores activos WHERE prestadorId IN (...) AND status = 'activo'
    await queryInterface.addIndex('permisos', ['prestadorId', 'status'], {
      name: 'idx_permisos_prestador_status',
      comment: 'Reporte prestadores activos: count por prestador + status',
    });

    // bloques: carga en reporte WHERE actividadId IN (...) AND organizationId = ?
    await queryInterface.addIndex('bloques', ['organizationId', 'actividadId'], {
      name: 'idx_bloques_org_actividad',
      comment: 'Reportes: bloques por org y actividad',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('capacidades', 'idx_capacidades_org_date');
    await queryInterface.removeIndex('eventos_operativos', 'idx_eventos_operativos_org_date_status');
    await queryInterface.removeIndex('eventos_operativos', 'idx_eventos_operativos_actividad_date_bloque');
    await queryInterface.removeIndex('permisos', 'idx_permisos_prestador_status');
    await queryInterface.removeIndex('bloques', 'idx_bloques_org_actividad');
  },
};
