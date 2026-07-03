'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'daily_exercise_stats',
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
            references: { model: 'users', key: 'user_id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          date: {
            allowNull: false,
            type: Sequelize.DATEONLY,
          },
          exercise_type_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: { model: 'exercise_types', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          scheduled_count: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          completed_count: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          is_finalized: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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

      await queryInterface.addConstraint('daily_exercise_stats', {
        fields: ['user_id', 'date', 'exercise_type_id'],
        type: 'unique',
        name: 'uq_daily_exercise_stats_user_date_type',
        transaction,
      });

      await queryInterface.addIndex('daily_exercise_stats', ['user_id'], {
        name: 'idx_daily_exercise_stats_user_id',
        transaction,
      });

      await queryInterface.addIndex('daily_exercise_stats', ['date'], {
        name: 'idx_daily_exercise_stats_date',
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('daily_exercise_stats', { transaction });
    });
  },
};
