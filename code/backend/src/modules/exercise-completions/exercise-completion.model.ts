import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';

@Table({
  tableName: 'exercise_completions',
  timestamps: true,
  updatedAt: false,
})
export class ExerciseCompletion extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => ExerciseSchedule)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  scheduleId!: string;

  @BelongsTo(() => ExerciseSchedule)
  schedule!: ExerciseSchedule;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  completionDatetime!: Date;
}
