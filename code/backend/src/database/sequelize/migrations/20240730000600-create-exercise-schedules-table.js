'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'exercise_schedules',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          user_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: 'users',
              key: 'user_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          exercise_type_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: 'exercise_types',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          recurrence_type: {
            allowNull: false,
            type: Sequelize.ENUM('HOURLY', 'DAILY', 'WEEKLY'),
          },
          recurrence_interval: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          start_datetime: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          timezone: {
            allowNull: false,
            type: Sequelize.STRING(64),
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE ONLY "exercise_schedules" ADD CONSTRAINT "chk_exercise_schedules_recurrence_interval" CHECK (recurrence_interval > 0)',
        { transaction },
      );

      await queryInterface.addIndex('exercise_schedules', ['user_id'], {
        name: 'idx_exercise_schedules_user_id',
        transaction,
      });

      await queryInterface.addIndex('exercise_schedules', ['exercise_type_id'], {
        name: 'idx_exercise_schedules_exercise_type_id',
        transaction,
      });
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('exercise_schedules', { transaction });
    });
  },
};
