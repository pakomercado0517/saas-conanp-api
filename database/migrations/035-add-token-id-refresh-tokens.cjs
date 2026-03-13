'use strict';

/**
 * Agrega columna tokenId a refresh_tokens para búsqueda O(1).
 * tokenId = primeros 16 caracteres del token en texto plano (indexado).
 * Tokens existentes se revocan y se les asigna un placeholder (no tenemos el plain token).
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('refresh_tokens', 'tokenId', {
      type: Sequelize.STRING(16),
      allowNull: true,
      comment: 'Primeros 16 caracteres del token (plain) para lookup O(1)',
    });

    // Revocar tokens existentes y asignar tokenId único para cumplir NOT NULL
    await queryInterface.sequelize.query(`
      UPDATE refresh_tokens
      SET "revokedAt" = CURRENT_TIMESTAMP,
          "tokenId" = SUBSTRING(REPLACE(id::text, '-', ''), 1, 16)
      WHERE "tokenId" IS NULL;
    `);

    await queryInterface.changeColumn('refresh_tokens', 'tokenId', {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: 'Primeros 16 caracteres del token (plain) para lookup O(1)',
    });

    await queryInterface.addIndex('refresh_tokens', ['tokenId'], {
      name: 'idx_refresh_tokens_token_id',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_token_id');
    await queryInterface.removeColumn('refresh_tokens', 'tokenId');
  },
};
