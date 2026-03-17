'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('subscription_plans', 'priceMonthly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.changeColumn('subscription_plans', 'priceYearly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('subscription_plans', 'priceMonthly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
    await queryInterface.changeColumn('subscription_plans', 'priceYearly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },
};
