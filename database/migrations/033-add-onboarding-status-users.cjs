'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'onboardingStatus',
        {
          type: Sequelize.ENUM('pending_setup', 'completed'),
          allowNull: false,
          defaultValue: 'completed',
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'onboardingStatus', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS \"enum_users_onboardingStatus\";',
        { transaction }
      );
    });
  },
};

