'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'email_notifications',
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
          notification_type: {
            allowNull: false,
            type: Sequelize.ENUM('UPCOMING', 'MISSED'),
          },
          sent_timestamp: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          email_status: {
            allowNull: false,
            type: Sequelize.ENUM('SENT', 'FAILED'),
            defaultValue: 'SENT',
          },
        },
        { transaction },
      );

      await queryInterface.addConstraint('email_notifications', {
        fields: ['user_id', 'schedule_id', 'notification_type', 'sent_timestamp'],
        type: 'unique',
        name: 'uq_email_notifications_user_schedule_type_sent',
        transaction,
      });

      await queryInterface.addIndex('email_notifications', ['user_id'], {
        name: 'idx_email_notifications_user_id',
        transaction,
      });

      await queryInterface.addIndex('email_notifications', ['schedule_id'], {
        name: 'idx_email_notifications_schedule_id',
        transaction,
      });

      await queryInterface.addIndex('email_notifications', ['notification_type', 'sent_timestamp'], {
        name: 'idx_email_notifications_type_sent',
        transaction,
      });
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('email_notifications', { transaction });
    });
  },
};
