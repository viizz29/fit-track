import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { User } from '../users/user.model';
import { EmailNotificationsModule } from '../email-notifications/email-notifications.module';
import { ExerciseNotificationsService } from './exercise-notifications.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ExerciseSchedule, ExerciseType, User]),
    EmailNotificationsModule,
  ],
  providers: [ExerciseNotificationsService],
})
export class ExerciseNotificationsModule {}
