import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(ExerciseSchedule)
    private scheduleModel: typeof ExerciseSchedule,
    @InjectModel(ExerciseCompletion)
    private completionModel: typeof ExerciseCompletion,
  ) {}

  async getCompletions(
    userId: string,
    startDate: string,
    endDate: string,
    period?: string,
  ) {
    const groupBy = period || 'day';

    const data = await this.completionModel.findAll({
      attributes: [
        [fn('date_trunc', groupBy, col('completion_datetime')), 'period'],
        [fn('COUNT', col('id')), 'count'],
      ],
      include: [
        {
          model: ExerciseSchedule,
          where: { user_id: userId },
          required: true,
          attributes: [],
        },
      ],
      where: {
        completion_datetime: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      group: [fn('date_trunc', groupBy, col('completion_datetime'))],
      order: [[fn('date_trunc', groupBy, col('completion_datetime')), 'ASC']],
      raw: true,
    });

    return data;
  }

  async getMissed(userId: string, startDate: string, endDate: string) {
    const schedules = await this.scheduleModel.findAll({
      where: { user_id: userId },
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const results: {
      schedule_id: string;
      name: string;
      expected: number;
      completed: number;
      missed: number;
    }[] = [];

    for (const schedule of schedules) {
      const scheduleStart = new Date(schedule.startDatetime);
      const effectiveStart = scheduleStart > start ? scheduleStart : start;

      if (effectiveStart > end) continue;

      const completions = await this.completionModel.count({
        where: {
          schedule_id: schedule.id,
          completion_datetime: {
            [Op.gte]: effectiveStart.toISOString(),
            [Op.lte]: end.toISOString(),
          },
        },
      });

      const expected = this.calculateExpectedOccurrences(
        schedule.recurrenceType,
        schedule.weekdays,
        effectiveStart,
        end,
      );

      const missed = Math.max(0, expected - completions);

      results.push({
        schedule_id: schedule.id,
        name: `Schedule ${schedule.id}`,
        expected,
        completed: completions,
        missed,
      });
    }

    return {
      totalExpected: results.reduce((s, r) => s + r.expected, 0),
      totalCompleted: results.reduce((s, r) => s + r.completed, 0),
      totalMissed: results.reduce((s, r) => s + r.missed, 0),
      details: results.filter((r) => r.missed > 0),
    };
  }

  async getCompletionRate(userId: string, startDate: string, endDate: string) {
    const schedules = await this.scheduleModel.findAll({
      where: { user_id: userId },
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalExpected = 0;
    let totalCompleted = 0;
    const dailyCompletions: Set<string> = new Set();

    for (const schedule of schedules) {
      const scheduleStart = new Date(schedule.get('startDatetime'));
      const effectiveStart = scheduleStart > start ? scheduleStart : start;

      if (effectiveStart > end) continue;

      const expected = this.calculateExpectedOccurrences(
        schedule.get('recurrenceType'),
        schedule.get('weekdays'),
        effectiveStart,
        end,
      );
      totalExpected += expected;

      const completions = await this.completionModel.findAll({
        where: {
          schedule_id: schedule.id,
          completion_datetime: {
            [Op.gte]: effectiveStart.toISOString(),
            [Op.lte]: end.toISOString(),
          },
        },
      });
      totalCompleted += completions.length;

      for (const c of completions) {
        const d = new Date(c.get('completionDatetime'))
          .toISOString()
          .slice(0, 10);
        dailyCompletions.add(d);
      }
    }

    const rate = totalExpected > 0 ? totalCompleted / totalExpected : 0;
    const allDates = this.getDateRange(start, end);
    const streakData = this.calculateStreaks(allDates, dailyCompletions);

    return {
      overallRate: Number(rate.toFixed(2)),
      completed: totalCompleted,
      expected: totalExpected,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      exerciseBreakdown: [],
    };
  }

  private calculateExpectedOccurrences(
    recurrenceType: string,
    weekdays: string[] | null,
    start: Date,
    end: Date,
  ): number {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    switch (recurrenceType) {
      case 'DAILY':
        return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      case 'WEEKLY': {
        if (!weekdays || weekdays.length === 0) return 0;
        const daySet = new Set(weekdays);
        let count = 0;
        const current = new Date(start);
        while (current <= end) {
          if (daySet.has(dayNames[current.getDay()])) {
            count++;
          }
          current.setDate(current.getDate() + 1);
        }
        return count;
      }
      default:
        return 0;
    }
  }

  private getDateRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  private calculateStreaks(allDates: string[], completedDates: Set<string>) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().slice(0, 10);

    for (const date of allDates) {
      if (completedDates.has(date)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        if (date <= today) {
          currentStreak = tempStreak;
        }
      } else {
        if (date >= today) {
          break;
        }
        tempStreak = 0;
        if (date < today) {
          currentStreak = 0;
        }
      }
    }

    return { currentStreak, longestStreak };
  }
}
