import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import moment from 'moment-timezone';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { User } from '../users/user.model';
import { EmailNotificationsService } from '../email-notifications/email-notifications.service';
import { MSG91 } from '../../util/send-email';

const WINDOW_MINUTES = 15;

@Injectable()
export class ExerciseNotificationsService {
  private readonly logger = new Logger(ExerciseNotificationsService.name);

  constructor(
    @InjectModel(ExerciseSchedule)
    private exerciseScheduleModel: typeof ExerciseSchedule,
    @InjectModel(ExerciseCompletion)
    private exerciseCompletionModel: typeof ExerciseCompletion,
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendExerciseNotifications() {
    const { ENABLE_NOTIFICATION_EMAILS } = process.env;

    if (!ENABLE_NOTIFICATION_EMAILS) return;

    const now = new Date();

    const schedules = await this.exerciseScheduleModel.findAll({
      include: [
        {
          model: User,
          attributes: [
            'userId',
            'name',
            'email',
            'isEmailNotificationsEnabled',
          ],
        },
        { model: ExerciseType, attributes: ['id', 'name', 'description'] },
      ],
      raw: true,
    });

    for (const schedule of schedules) {
      try {
        await this.handleUpcoming(schedule, now);
        await this.handleMissed(schedule, now);
      } catch (error) {
        this.logger.error(
          `Error processing schedule ${schedule.id}: ${error.message}`,
        );
      }
    }
  }

  private async handleUpcoming(schedule: ExerciseSchedule, now: Date) {
    const nextOccurrence = this.getNextOccurrence(schedule, now);
    if (!nextOccurrence) return;

    const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);
    if (nextOccurrence > windowEnd || nextOccurrence < now) return;

    const alreadySent =
      await this.emailNotificationsService.hasNotificationBeenSent(
        schedule.id,
        'UPCOMING',
        nextOccurrence,
      );
    if (alreadySent) return;

    const name = schedule['user.name'] as string;
    const email = schedule['user.email'] as string;
    if (!email) return;

    const notificationsEnabled =
      schedule['user.isEmailNotificationsEnabled'] !== false;
    if (!notificationsEnabled) return;

    let status = 'SENT';
    try {
      await MSG91.sendUpcomingTaskNotification(
        name,
        email,
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
  }

  private async handleMissed(schedule: ExerciseSchedule, now: Date) {
    const prevOccurrence = this.getPreviousOccurrence(schedule, now);
    if (!prevOccurrence) return;

    const missedThreshold = new Date(
      prevOccurrence.getTime() + WINDOW_MINUTES * 60 * 1000,
    );
    if (now < missedThreshold) return;

    const alreadySent =
      await this.emailNotificationsService.hasNotificationBeenSent(
        schedule.id,
        'MISSED',
        prevOccurrence,
      );
    if (alreadySent) return;

    const wasCompleted = await this.hasCompletionForOccurrence(
      schedule.id,
      prevOccurrence,
    );
    if (wasCompleted) return;

    const name = schedule['user.name'] as string;
    const email = schedule['user.email'] as string;
    if (!email) return;

    const notificationsEnabled =
      schedule['user.isEmailNotificationsEnabled'] !== false;
    if (!notificationsEnabled) return;

    let status = 'SENT';
    try {
      await MSG91.sendMissedTaskNotification(
        name,
        email,
        schedule['exerciseType.name'] as string,
        (schedule['exerciseType.description'] as string) || '',
      );
    } catch {
      status = 'FAILED';
    }

    await this.emailNotificationsService.logNotification(
      schedule.id,
      schedule['user.userId'] as string,
      'MISSED',
      prevOccurrence,
      status,
    );
  }

  private async hasCompletionForOccurrence(
    scheduleId: string,
    occurrence: Date,
  ): Promise<boolean> {
    const dayEnd = new Date(occurrence);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await this.exerciseCompletionModel.count({
      where: {
        scheduleId,
        completionDatetime: {
          [Op.gte]: occurrence,
          [Op.lte]: dayEnd,
        },
      },
    });
    return count > 0;
  }

  private getNextOccurrence(
    schedule: ExerciseSchedule,
    now: Date,
  ): Date | null {
    const tz = schedule.timezone;
    const localStart = moment.utc(schedule.startDatetime).tz(tz);
    const hour = localStart.hour();
    const minute = localStart.minute();
    const seconds = localStart.second();

    if (schedule.recurrenceType === 'DAILY') {
      const todayLocal = moment
        .tz(tz)
        .hour(hour)
        .minute(minute)
        .second(seconds)
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
          .second(seconds)
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

  private getPreviousOccurrence(
    schedule: ExerciseSchedule,
    now: Date,
  ): Date | null {
    const tz = schedule.timezone;
    const localStart = moment.utc(schedule.startDatetime).tz(tz);
    const hour = localStart.hour();
    const minute = localStart.minute();
    const seconds = localStart.second();
    const scheduleStartUtc = moment.utc(schedule.startDatetime).valueOf();

    if (schedule.recurrenceType === 'DAILY') {
      const todayLocal = moment
        .tz(tz)
        .hour(hour)
        .minute(minute)
        .second(seconds)
        .millisecond(0);
      const todayUtc = todayLocal.clone().utc();

      if (todayUtc.isBefore(now)) {
        if (todayUtc.valueOf() >= scheduleStartUtc) return todayUtc.toDate();
      }

      const yesterdayLocal = todayLocal.clone().subtract(1, 'day');
      const yesterdayUtc = yesterdayLocal.clone().utc();
      if (
        yesterdayUtc.isBefore(now) &&
        yesterdayUtc.valueOf() >= scheduleStartUtc
      ) {
        return yesterdayUtc.toDate();
      }

      return null;
    }

    if (schedule.recurrenceType === 'WEEKLY' && schedule.weekdays) {
      for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
        const candidateLocal = moment
          .tz(tz)
          .subtract(daysAgo, 'days')
          .hour(hour)
          .minute(minute)
          .second(seconds)
          .millisecond(0);
        const candidateUtc = candidateLocal.clone().utc();
        if (candidateUtc.isBefore(now)) {
          const dayAbbr = candidateLocal.format('ddd').toUpperCase();
          if (
            schedule.weekdays.includes(dayAbbr) &&
            candidateUtc.valueOf() >= scheduleStartUtc
          ) {
            return candidateUtc.toDate();
          }
        }
      }

      const todayLocal = moment
        .tz(tz)
        .hour(hour)
        .minute(minute)
        .second(seconds)
        .millisecond(0);
      const todayUtc = todayLocal.clone().utc();
      if (todayUtc.isBefore(now)) {
        const dayAbbr = todayLocal.format('ddd').toUpperCase();
        if (
          schedule.weekdays.includes(dayAbbr) &&
          todayUtc.valueOf() >= scheduleStartUtc
        ) {
          return todayUtc.toDate();
        }
      }
    }

    return null;
  }
}
