import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import moment from 'moment-timezone';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { User } from '../users/user.model';
import { EmailNotificationsService } from '../email-notifications/email-notifications.service';
import { MSG91 } from '../../util/send-email';
import { ENABLE_NOTIFICATION_EMAILS } from '../../config';

const NOTIFICATION_WINDOW_MINUTES = 15;

@Injectable()
export class ExerciseNotificationsService {
  private readonly logger = new Logger(ExerciseNotificationsService.name);

  constructor(
    @InjectModel(ExerciseSchedule)
    private exerciseScheduleModel: typeof ExerciseSchedule,
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendUpcomingExerciseNotifications() {
    if (!ENABLE_NOTIFICATION_EMAILS) return;

    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + NOTIFICATION_WINDOW_MINUTES * 60 * 1000,
    );

    const schedules = await this.exerciseScheduleModel.findAll({
      include: [
        { model: User, attributes: ['userId', 'name', 'email'] },
        { model: ExerciseType, attributes: ['id', 'name', 'description'] },
      ],
      raw: true,
    });

    // console.log(schedules);

    for (const schedule of schedules) {
      try {
        const nextOccurrence = this.getNextOccurrence(schedule, now);
        if (!nextOccurrence) continue;

        if (nextOccurrence > windowEnd) continue;
        if (nextOccurrence < now) continue;

        const alreadySent =
          await this.emailNotificationsService.hasNotificationBeenSent(
            schedule.id,
            'UPCOMING',
            nextOccurrence,
          );
        if (alreadySent) continue;

        let status = 'SENT';
        try {
          await MSG91.sendUpcomingTaskNotification(
            schedule['user.name'] as string,
            schedule['user.email'] as string,
            schedule['exerciseType.name'] as string,
            (schedule['exerciseType.description'] as string) || '',
          );
        } catch {
          status = 'FAILED';
        }

        await this.emailNotificationsService.logNotification(
          schedule.id,
          schedule['user.userId'] as string,
          'UPCOMING',
          nextOccurrence,
          status,
        );

        this.logger.log(
          `Upcoming notification ${status} for schedule ${schedule.id} user ${schedule['user.userId']} occurrence ${nextOccurrence.toISOString()}`,
        );
      } catch (error) {
        this.logger.error(
          `Error processing schedule ${schedule.id}: ${error.message}`,
        );
      }
    }
  }

  private getNextOccurrence(
    schedule: ExerciseSchedule,
    now: Date,
  ): Date | null {
    const tz = schedule.timezone;
    const localStart = moment.utc(schedule.startDatetime).tz(tz);
    const hour = localStart.hour();
    const minute = localStart.minute();

    if (schedule.recurrenceType === 'DAILY') {
      const todayLocal = moment
        .tz(tz)
        .hour(hour)
        .minute(minute)
        .second(0)
        .millisecond(0);
      const todayUtc = todayLocal.clone().utc();
      if (todayUtc.isAfter(now)) return todayUtc.toDate();

      const tomorrowLocal = todayLocal.clone().add(1, 'day');
      return tomorrowLocal.clone().utc().toDate();
    }

    if (schedule.recurrenceType === 'WEEKLY' && schedule.weekdays) {
      for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
        const candidateLocal = moment
          .tz(tz)
          .add(daysAhead, 'days')
          .hour(hour)
          .minute(minute)
          .second(0)
          .millisecond(0);
        const candidateUtc = candidateLocal.clone().utc();
        if (candidateUtc.isAfter(now)) {
          const dayAbbr = candidateLocal.format('ddd').toUpperCase();
          if (schedule.weekdays.includes(dayAbbr)) {
            return candidateUtc.toDate();
          }
        }
      }
    }

    return null;
  }
}
