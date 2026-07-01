'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'exercise_types',
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
          name: {
            allowNull: false,
            type: Sequelize.STRING(100),
          },
          description: {
            allowNull: true,
            type: Sequelize.TEXT,
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

      await queryInterface.addConstraint('exercise_types', {
        fields: ['user_id', 'name'],
        type: 'unique',
        name: 'uq_exercise_types_user_id_name',
        transaction,
      });

      await queryInterface.addIndex('exercise_types', ['user_id'], {
        name: 'idx_exercise_types_user_id',
        transaction,
      });
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('exercise_types', { transaction });
    });
  },
};
