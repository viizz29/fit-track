'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE TYPE recurrence_type_enum AS ENUM(\'HOURLY\', \'DAILY\', \'WEEKLY\');');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS recurrence_type_enum;');
  }
};
