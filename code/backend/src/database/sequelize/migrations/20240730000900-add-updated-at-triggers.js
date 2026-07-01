'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON exercise_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    );
    await queryInterface.sequelize.query(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON exercise_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS set_updated_at ON exercise_types;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS set_updated_at ON exercise_schedules;');
  }
};
