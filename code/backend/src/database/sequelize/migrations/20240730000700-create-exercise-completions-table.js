'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'exercise_completions',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          schedule_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: 'exercise_schedules',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          completion_datetime: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('exercise_completions', ['schedule_id'], {
        name: 'idx_exercise_completions_schedule_id',
        transaction,
      });

      await queryInterface.addIndex('exercise_completions', ['completion_datetime'], {
        name: 'idx_exercise_completions_completion_datetime',
        transaction,
      });
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('exercise_completions', { transaction });
    });
  },
};
