'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      throw new Error('This migration is for PostgreSQL only');
    }

    // 1. Create dependencias table
    await queryInterface.createTable('dependencias', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
    await queryInterface.addIndex('dependencias', ['name'], { name: 'idx_dependencias_name' });

    // 2. Create dependencia_memberships table
    await queryInterface.createTable('dependencia_memberships', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dependenciaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'dependencias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'gestor', 'prestador', 'observador'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addIndex('dependencia_memberships', ['userId', 'dependenciaId'], {
      name: 'idx_dep_memberships_user_dep',
      unique: true,
    });
    await queryInterface.addIndex('dependencia_memberships', ['dependenciaId'], {
      name: 'idx_dep_memberships_dependencia',
    });
    await queryInterface.addIndex('dependencia_memberships', ['userId'], {
      name: 'idx_dep_memberships_user',
    });

    // 3. Add dependenciaId to organizations (nullable first)
    await queryInterface.addColumn('organizations', 'dependenciaId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'dependencias', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // 4. Drop all foreign keys that reference organizations (so we can rename table)
    const [fkList] = await queryInterface.sequelize.query(`
      SELECT c.conrelid::regclass::text AS table_name, c.conname AS constraint_name
      FROM pg_constraint c
      WHERE c.confrelid = 'organizations'::regclass AND c.contype = 'f'
    `);
    for (const fk of fkList) {
      const tableName = fk.table_name.replace(/^"|"$/g, '').replace(/^public\./, '');
      await queryInterface.removeConstraint(tableName, fk.constraint_name);
    }

    // subscriptions: drop unique constraint on organizationId if exists
    const [subConstraints] = await queryInterface.sequelize.query(`
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'subscriptions'::regclass AND contype IN ('f', 'u')
      AND pg_get_constraintdef(oid) LIKE '%organizationId%'
    `);
    if (subConstraints && subConstraints.length) {
      for (const c of subConstraints) {
        await queryInterface.removeConstraint('subscriptions', c.conname);
      }
    }

    // 5. Rename organizations -> areas
    await queryInterface.renameTable('organizations', 'areas');

    // 6. areas.dependenciaId NOT NULL (0 rows; FK already added in step 3)
    await queryInterface.changeColumn('areas', 'dependenciaId', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addIndex('areas', ['dependenciaId'], { name: 'idx_areas_dependencia' });

    // 7. memberships: organizationId -> areaId, FK to areas
    await queryInterface.renameColumn('memberships', 'organizationId', 'areaId');
    await queryInterface.addConstraint('memberships', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'memberships_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_memberships_user_org; CREATE UNIQUE INDEX idx_memberships_user_area ON memberships("userId", "areaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_memberships_organization; CREATE INDEX idx_memberships_area ON memberships("areaId");'
    );

    // 8. subscriptions: organizationId -> dependenciaId, FK to dependencias
    await queryInterface.renameColumn('subscriptions', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('subscriptions', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'subscriptions_dependenciaId_dependencias_fk',
    });
    await queryInterface.addIndex('subscriptions', ['dependenciaId'], {
      name: 'idx_subscriptions_dependencia_id',
      unique: true,
    });

    // 9. prestador_profiles: organizationId -> dependenciaId
    await queryInterface.renameColumn('prestador_profiles', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('prestador_profiles', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'prestador_profiles_dependenciaId_dependencias_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_prestador_profiles_user_org; CREATE UNIQUE INDEX idx_prestador_profiles_user_dep ON prestador_profiles("userId", "dependenciaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_prestador_profiles_organization; CREATE INDEX idx_prestador_profiles_dependencia ON prestador_profiles("dependenciaId");'
    );

    // 10. actividades: organizationId -> areaId
    await queryInterface.renameColumn('actividades', 'organizationId', 'areaId');
    await queryInterface.addConstraint('actividades', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'actividades_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_actividades_organization; CREATE INDEX idx_actividades_area ON actividades("areaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_actividades_org_active; CREATE INDEX idx_actividades_area_active ON actividades("areaId", "active");'
    );

    // 11. bloques: organizationId -> areaId
    await queryInterface.renameColumn('bloques', 'organizationId', 'areaId');
    await queryInterface.addConstraint('bloques', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'bloques_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_bloques_organization; CREATE INDEX idx_bloques_area ON bloques("areaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_bloques_org_actividad; CREATE INDEX idx_bloques_area_actividad ON bloques("areaId", "actividadId");'
    );

    // 12. capacidades: organizationId -> areaId
    await queryInterface.renameColumn('capacidades', 'organizationId', 'areaId');
    await queryInterface.addConstraint('capacidades', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'capacidades_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_capacidades_organization; CREATE INDEX idx_capacidades_area ON capacidades("areaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_capacidades_org_date; CREATE INDEX idx_capacidades_area_date ON capacidades("areaId", "date");'
    );

    // 13. activos: organizationId -> dependenciaId
    await queryInterface.renameColumn('activos', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('activos', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'activos_dependenciaId_dependencias_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_activos_organization; CREATE INDEX idx_activos_dependencia ON activos("dependenciaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_activos_organization_owner; CREATE INDEX idx_activos_dependencia_owner ON activos("dependenciaId", "ownerId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_activos_organization_status; CREATE INDEX idx_activos_dependencia_status ON activos("dependenciaId", "status");'
    );

    // 14. eventos_operativos: organizationId -> areaId
    await queryInterface.renameColumn('eventos_operativos', 'organizationId', 'areaId');
    await queryInterface.addConstraint('eventos_operativos', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'eventos_operativos_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_eventos_operativos_organization; CREATE INDEX idx_eventos_operativos_area ON eventos_operativos("areaId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_eventos_operativos_organization_date; CREATE INDEX idx_eventos_operativos_area_date ON eventos_operativos("areaId", "date");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_eventos_operativos_org_date_status; CREATE INDEX idx_eventos_operativos_area_date_status ON eventos_operativos("areaId", "date", "status");'
    );

    // 15. payments: organizationId -> areaId
    await queryInterface.renameColumn('payments', 'organizationId', 'areaId');
    await queryInterface.addConstraint('payments', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'payments_areaId_areas_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_payments_organization_id; CREATE INDEX idx_payments_area_id ON payments("areaId");'
    );

    // 16. invitations: organizationId -> areaId
    await queryInterface.renameColumn('invitations', 'organizationId', 'areaId');
    await queryInterface.addConstraint('invitations', {
      fields: ['areaId'],
      type: 'foreign key',
      references: { table: 'areas', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'invitations_areaId_areas_fk',
    });
    await queryInterface.removeIndex('invitations', 'idx_invitations_org_email_status');
    await queryInterface.removeIndex('invitations', 'idx_invitations_organization');
    await queryInterface.addIndex('invitations', ['areaId', 'email', 'status'], {
      name: 'idx_invitations_area_email_status',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_invitations_organization_id; CREATE INDEX idx_invitations_area_id ON invitations("areaId");'
    );

    // 17. productos_acceso: organizationId -> dependenciaId
    await queryInterface.renameColumn('productos_acceso', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('productos_acceso', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'productos_acceso_dependenciaId_dependencias_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_productos_acceso_organization; CREATE INDEX idx_productos_acceso_dependencia ON productos_acceso("dependenciaId");'
    );

    // 18. stocks_acceso: organizationId -> dependenciaId
    await queryInterface.renameColumn('stocks_acceso', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('stocks_acceso', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'stocks_acceso_dependenciaId_dependencias_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_stocks_acceso_organization_producto; CREATE UNIQUE INDEX idx_stocks_acceso_dependencia_producto ON stocks_acceso("dependenciaId", "productoAccesoId");'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_stocks_acceso_organization; CREATE INDEX idx_stocks_acceso_dependencia ON stocks_acceso("dependenciaId");'
    );

    // 19. movimientos_stock_acceso: organizationId -> dependenciaId
    await queryInterface.renameColumn('movimientos_stock_acceso', 'organizationId', 'dependenciaId');
    await queryInterface.addConstraint('movimientos_stock_acceso', {
      fields: ['dependenciaId'],
      type: 'foreign key',
      references: { table: 'dependencias', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'movimientos_stock_acceso_dependenciaId_dependencias_fk',
    });
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_movimientos_stock_organization; CREATE INDEX idx_movimientos_stock_dependencia ON movimientos_stock_acceso("dependenciaId");'
    );

    // 20. areas: drop old indexes that referenced name/ecosystem_type (keep new ones)
    await queryInterface.removeIndex('areas', 'idx_organizations_name');
    await queryInterface.removeIndex('areas', 'idx_organizations_ecosystem_type');
    await queryInterface.addIndex('areas', ['name'], { name: 'idx_areas_name' });
    await queryInterface.addIndex('areas', ['ecosystem_type'], { name: 'idx_areas_ecosystem_type' });
    await queryInterface.removeIndex('areas', 'idx_organizations_deleted_at');
    await queryInterface.addIndex('areas', ['deletedAt'], { name: 'idx_areas_deleted_at' });
  },

  async down(queryInterface, Sequelize) {
    throw new Error('Down migration not implemented for big-bang; restore from backup if needed.');
  },
};
