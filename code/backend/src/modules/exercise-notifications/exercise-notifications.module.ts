import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { User } from '../users/user.model';
import { EmailNotificationsModule } from '../email-notifications/email-notifications.module';
import { ExerciseNotificationsService } from './exercise-notifications.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ExerciseSchedule,
      ExerciseType,
      ExerciseCompletion,
      User,
    ]),
    EmailNotificationsModule,
    MailModule,
  ],
  providers: [ExerciseNotificationsService],
})
export class ExerciseNotificationsModule {}
