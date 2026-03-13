'use strict';

/**
 * Row Level Security (RLS) for multi-tenant data isolation.
 *
 * Session variables used by policies:
 *   app.current_area_id  – UUID of the current area (set by setTenantContext middleware)
 *   app.current_dep_id   – UUID of the current dependencia
 *   app.rls_bypass       – 'true' for super-admin access
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const q = (sql) => queryInterface.sequelize.query(sql, { transaction });

      // ──────────────────────────────────────────────
      // Tables with areaId policy (5)
      // ──────────────────────────────────────────────
      const areaTables = [
        'actividades',
        'bloques',
        'capacidades',
        'eventos_operativos',
        'payments',
      ];

      for (const table of areaTables) {
        await q(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
        await q(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
        await q(`
          CREATE POLICY tenant_area_${table} ON "${table}"
            USING (
              "areaId"::text = current_setting('app.current_area_id', true)
              OR current_setting('app.rls_bypass', true) = 'true'
            );
        `);
      }

      // ──────────────────────────────────────────────
      // Tables with dependenciaId policy (6)
      // ──────────────────────────────────────────────
      const depTables = [
        'activos',
        'prestador_profiles',
        'productos_acceso',
        'stocks_acceso',
        'movimientos_stock_acceso',
      ];

      for (const table of depTables) {
        await q(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
        await q(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
        await q(`
          CREATE POLICY tenant_dep_${table} ON "${table}"
            USING (
              "dependenciaId"::text = current_setting('app.current_dep_id', true)
              OR current_setting('app.rls_bypass', true) = 'true'
            );
        `);
      }

      // ──────────────────────────────────────────────
      // Tables with indirect (subquery) policies (3)
      // ──────────────────────────────────────────────

      // permisos → actividadId → actividades.areaId
      await q(`ALTER TABLE "permisos" ENABLE ROW LEVEL SECURITY;`);
      await q(`ALTER TABLE "permisos" FORCE ROW LEVEL SECURITY;`);
      await q(`
        CREATE POLICY tenant_permisos ON "permisos"
          USING (
            "actividadId" IN (
              SELECT id FROM "actividades"
              WHERE "areaId"::text = current_setting('app.current_area_id', true)
            )
            OR current_setting('app.rls_bypass', true) = 'true'
          );
      `);

      // activo_requisitos → activoId → activos.dependenciaId
      await q(`ALTER TABLE "activo_requisitos" ENABLE ROW LEVEL SECURITY;`);
      await q(`ALTER TABLE "activo_requisitos" FORCE ROW LEVEL SECURITY;`);
      await q(`
        CREATE POLICY tenant_activo_requisitos ON "activo_requisitos"
          USING (
            "activoId" IN (
              SELECT id FROM "activos"
              WHERE "dependenciaId"::text = current_setting('app.current_dep_id', true)
            )
            OR current_setting('app.rls_bypass', true) = 'true'
          );
      `);

      // evidencias_ambientales → eventoId → eventos_operativos.areaId
      await q(`ALTER TABLE "evidencias_ambientales" ENABLE ROW LEVEL SECURITY;`);
      await q(`ALTER TABLE "evidencias_ambientales" FORCE ROW LEVEL SECURITY;`);
      await q(`
        CREATE POLICY tenant_evidencias_ambientales ON "evidencias_ambientales"
          USING (
            "eventoId" IN (
              SELECT id FROM "eventos_operativos"
              WHERE "areaId"::text = current_setting('app.current_area_id', true)
            )
            OR current_setting('app.rls_bypass', true) = 'true'
          );
      `);
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const q = (sql) => queryInterface.sequelize.query(sql, { transaction });

      const allTables = [
        'actividades',
        'bloques',
        'capacidades',
        'eventos_operativos',
        'payments',
        'activos',
        'prestador_profiles',
        'productos_acceso',
        'stocks_acceso',
        'movimientos_stock_acceso',
        'permisos',
        'activo_requisitos',
        'evidencias_ambientales',
      ];

      for (const table of allTables) {
        const policyPrefix = ['activos', 'prestador_profiles', 'productos_acceso',
          'stocks_acceso', 'movimientos_stock_acceso'].includes(table)
          ? 'tenant_dep_'
          : ['permisos', 'activo_requisitos', 'evidencias_ambientales'].includes(table)
            ? 'tenant_'
            : 'tenant_area_';

        await q(`DROP POLICY IF EXISTS ${policyPrefix}${table} ON "${table}";`);
        await q(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
      }
    });
  },
};
