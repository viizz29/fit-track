import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';

@Table({
  tableName: 'exercise_schedules',
  timestamps: true,
})
export class ExerciseSchedule extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => ExerciseType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  exerciseTypeId!: string;

  @BelongsTo(() => ExerciseType)
  exerciseType!: ExerciseType;

  @Column({
    type: DataType.ENUM('DAILY', 'WEEKLY'),
    allowNull: false,
  })
  recurrenceType!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING(3)),
    allowNull: true,
  })
  weekdays!: string[] | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDatetime!: Date;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  timezone!: string;
}
