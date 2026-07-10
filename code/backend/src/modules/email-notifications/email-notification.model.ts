import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';

@Table({
  tableName: 'email_notifications',
  timestamps: false,
})
export class EmailNotification extends Model {
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

  @ForeignKey(() => ExerciseSchedule)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  scheduleId!: string;

  @BelongsTo(() => ExerciseSchedule)
  schedule!: ExerciseSchedule;

  @Column({
    type: DataType.ENUM('UPCOMING', 'MISSED'),
    allowNull: false,
  })
  notificationType!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  sentTimestamp!: Date;

  @Column({
    type: DataType.ENUM('SENT', 'FAILED'),
    allowNull: false,
    defaultValue: 'SENT',
  })
  emailStatus!: string;
}
