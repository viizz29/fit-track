import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ExerciseStatsRepository } from './exercise-stats.repository';
import { ExerciseSchedulesRepository } from '../exercise-schedules/exercise-schedules.repository';
import { User } from '../users/user.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';

@Injectable()
export class ExerciseStatsService {
  constructor(
    private readonly statsRepository: ExerciseStatsRepository,
    private readonly schedulesRepository: ExerciseSchedulesRepository,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(ExerciseCompletion)
    private completionModel: typeof ExerciseCompletion,
  ) {}

  // @Cron('0 */30 * * * *') // every 30 minutes
  // @Cron('0 */1 * * * *') // every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async computeDailyStats() {
    const { SCHEDULED_TASKS_ENABLED } = process.env;
    if (!SCHEDULED_TASKS_ENABLED) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasUnfinalizedYesterday =
      await this.statsRepository.hasUnfinalized(yesterdayStr);
    if (hasUnfinalizedYesterday) {
      await this.computeAndStore(yesterdayStr);
      await this.statsRepository.finalizeDate(yesterdayStr);
    }
  }

  private async computeAndStore(dateStr: string) {
    const dayStart = new Date(dateStr);
    const dayEnd = new Date(dateStr);
    dayEnd.setHours(23, 59, 59, 999);

    const users = await this.userModel.findAll({ attributes: ['userId'] });
    const dateStart = new Date(dateStr);

    for (const user of users) {
      const userId = user.get('userId');
      const schedules = await this.schedulesRepository.findAllByUser(userId);

      const activeSchedules = this.filterActiveOnDate(schedules, dateStart);

      if (activeSchedules.length === 0) continue;

      const scheduleIds = activeSchedules.map((s) => s.id);

      const completions = await this.completionModel.findAll({
        where: {
          scheduleId: { [Op.in]: scheduleIds },
          completionDatetime: { [Op.gte]: dayStart, [Op.lte]: dayEnd },
        },
        attributes: ['scheduleId'],
        raw: true,
      });

      const completionCountBySchedule: Record<string, number> = {};
      for (const c of completions) {
        const sid = c.scheduleId;
        completionCountBySchedule[sid] =
          (completionCountBySchedule[sid] || 0) + 1;
      }

      const statsByType: Record<
        string,
        { scheduled: number; completed: number }
      > = {};
      for (const schedule of activeSchedules) {
        const typeId = schedule.exerciseTypeId;
        if (!statsByType[typeId]) {
          statsByType[typeId] = { scheduled: 0, completed: 0 };
        }
        statsByType[typeId].scheduled++;
        statsByType[typeId].completed +=
          completionCountBySchedule[schedule.id] || 0;
      }

      for (const [typeId, counts] of Object.entries(statsByType)) {
        await this.statsRepository.upsert(
          userId,
          dateStr,
          typeId,
          counts.scheduled,
          counts.completed,
        );
      }
    }
  }

  async findAllTimeByUser(userId: string) {
    const stats = await this.statsRepository.findAllTimeByUser(userId);
    const grouped: Record<
      string,
      {
        exerciseTypeId: string;
        exerciseType: object;
        totalScheduled: number;
        totalCompleted: number;
      }
    > = {};
    for (const stat of stats) {
      const typeId = stat.exerciseTypeId;
      if (!grouped[typeId]) {
        grouped[typeId] = {
          exerciseTypeId: typeId,
          exerciseType: stat.exerciseType,
          totalScheduled: 0,
          totalCompleted: 0,
        };
      }
      grouped[typeId].totalScheduled += stat.scheduledCount;
      grouped[typeId].totalCompleted += stat.completedCount;
    }
    return Object.values(grouped);
  }

  private filterActiveOnDate(
    schedules: ExerciseSchedule[],
    date: Date,
  ): ExerciseSchedule[] {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return schedules.filter((schedule) => {
      const start = new Date(schedule.startDatetime);
      start.setHours(0, 0, 0, 0);
      if (date < start) return false;

      switch (schedule.recurrenceType) {
        case 'DAILY':
          return true;
        case 'WEEKLY': {
          if (!schedule.weekdays || schedule.weekdays.length === 0)
            return false;
          return schedule.weekdays.includes(dayNames[date.getDay()]);
        }
        default:
          return false;
      }
    });
  }
}
