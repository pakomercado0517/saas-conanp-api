'use strict';

/**
 * Seed: primer super admin.
 *
 * Crea un usuario con email verificado para usar como super administrador.
 * El email y la contraseña se leen de variables de entorno:
 *
 *   SEED_SUPER_ADMIN_EMAIL   (ej: admin@conanp.local)
 *   SEED_SUPER_ADMIN_PASSWORD (ej: ChangeMe123!)
 *
 * Después de ejecutar el seed:
 * 1. Añade ese mismo email a SUPER_ADMIN_EMAILS en .env (ej: SUPER_ADMIN_EMAILS=admin@conanp.local)
 * 2. Reinicia el servidor y haz login con ese usuario (Auth → Login en Postman).
 *
 * Si el usuario ya existe (mismo email), el seed no hace nada.
 */
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const BCRYPT_ROUNDS = 10;

module.exports = {
  async up(queryInterface) {
    const email = process.env.SEED_SUPER_ADMIN_EMAIL;
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn(
        'Seed first-super-admin: SEED_SUPER_ADMIN_EMAIL y SEED_SUPER_ADMIN_PASSWORD no están definidas. Saltando.'
      );
      return;
    }

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email AND "deletedAt" IS NULL',
      {
        replacements: { email: email.trim().toLowerCase() },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (existing) {
      console.warn('Seed first-super-admin: el usuario con ese email ya existe. Saltando.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const id = crypto.randomUUID();
    const now = new Date();
    const normalizedEmail = email.trim().toLowerCase();

    await queryInterface.bulkInsert('users', [
      {
        id,
        email: normalizedEmail,
        password: hashedPassword,
        name: 'Super Admin',
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ]);

    console.log(`Seed first-super-admin: usuario creado ${normalizedEmail}. Añade SUPER_ADMIN_EMAILS=${normalizedEmail} en .env y reinicia el servidor.`);
  },

  async down(queryInterface) {
    const email = process.env.SEED_SUPER_ADMIN_EMAIL;
    if (!email) return;

    await queryInterface.sequelize.query('DELETE FROM users WHERE email = :email', {
      replacements: { email: email.trim().toLowerCase() },
    });
  },
};
