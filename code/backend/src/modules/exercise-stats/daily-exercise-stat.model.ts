import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';

@Table({ tableName: 'daily_exercise_stats', timestamps: true })
export class DailyExerciseStat extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date!: string;

  @ForeignKey(() => ExerciseType)
  @Column({ type: DataType.UUID, allowNull: false })
  exerciseTypeId!: string;

  @BelongsTo(() => ExerciseType)
  exerciseType!: ExerciseType;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  scheduledCount!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  completedCount!: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isFinalized!: boolean;
}
