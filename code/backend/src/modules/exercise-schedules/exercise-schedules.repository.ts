import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ExerciseSchedule } from './exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { CreateExerciseScheduleDto } from './dto/create-exercise-schedule.dto';

@Injectable()
export class ExerciseSchedulesRepository {
  constructor(
    @InjectModel(ExerciseSchedule)
    private exerciseScheduleModel: typeof ExerciseSchedule,
    @InjectModel(ExerciseCompletion)
    private exerciseCompletionModel: typeof ExerciseCompletion,
  ) {}

  async create(
    dto: CreateExerciseScheduleDto,
    userId: string,
  ): Promise<ExerciseSchedule> {
    return this.exerciseScheduleModel.create({ ...dto, userId } as any);
  }

  async findAllByUser(userId: string): Promise<ExerciseSchedule[]> {
    return this.exerciseScheduleModel.findAll({
      where: { userId },
      include: [ExerciseType],
    });
  }

  async findByDate(
    userId: string,
    date: string,
  ): Promise<{
    HOURLY: ExerciseSchedule[];
    DAILY: ExerciseSchedule[];
    WEEKLY: ExerciseSchedule[];
  }> {
    const schedules = await this.findAllByUser(userId);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const dayEnd = new Date(target);
    dayEnd.setHours(23, 59, 59, 999);

    const weekEnd = new Date(target);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const active = schedules.filter((schedule) => {
      const start = new Date(schedule.get('startDatetime'));
      start.setHours(0, 0, 0, 0);

      if (target < start) return false;

      const diffMs = target.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      switch (schedule.get('recurrenceType')) {
        case 'DAILY':
          return diffDays % schedule.get('recurrenceInterval') === 0;
        case 'WEEKLY':
          return (
            Math.floor(diffDays / 7) % schedule.get('recurrenceInterval') === 0
          );
        case 'HOURLY':
          return true;
        default:
          return false;
      }
    });

    const activeIds = active.map((s) => s.get('id'));

    const completions = await this.exerciseCompletionModel.findAll({
      where: {
        schedule_id: { [Op.in]: activeIds },
        completionDatetime: {
          [Op.gte]: target,
          [Op.lt]: weekEnd,
        },
      },
    });

    const now = new Date();
    const isToday =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();

    const currentHourStart = new Date(target);
    currentHourStart.setHours(isToday ? now.getHours() : 0, 0, 0, 0);
    const currentHourEnd = new Date(currentHourStart);
    currentHourEnd.setHours(currentHourStart.getHours() + 1, 0, 0, 0);

    const getMonday = (d: Date) => {
      const m = new Date(d);
      const day = m.getDay();
      const diff = m.getDate() - day + (day === 0 ? -6 : 1);
      m.setDate(diff);
      m.setHours(0, 0, 0, 0);
      return m;
    };

    const weekStart = getMonday(target);
    const weekEndDt = new Date(weekStart);
    weekEndDt.setDate(weekEndDt.getDate() + 7);

    const isCompleted = (scheduleId: string, type: string): boolean => {
      return completions.some((c) => {
        if (c.get('scheduleId') !== scheduleId) return false;
        const cd = new Date(c.get('completionDatetime'));

        switch (type) {
          case 'DAILY':
            return cd >= target && cd <= dayEnd;
          case 'WEEKLY':
            return cd >= weekStart && cd < weekEndDt;
          case 'HOURLY':
            return isToday && cd >= currentHourStart && cd < currentHourEnd;
          default:
            return false;
        }
      });
    };

    const grouped: {
      HOURLY: ExerciseSchedule[];
      DAILY: ExerciseSchedule[];
      WEEKLY: ExerciseSchedule[];
    } = {
      HOURLY: [],
      DAILY: [],
      WEEKLY: [],
    };

    for (const schedule of active) {
      const type = schedule.get('recurrenceType') as keyof typeof grouped;
      if (!isCompleted(schedule.get('id'), type)) {
        grouped[type].push(schedule);
      }
    }

    return grouped;
  }

  async findById(id: string): Promise<ExerciseSchedule | null> {
    return this.exerciseScheduleModel.findByPk(id, {
      include: [ExerciseType],
    });
  }

  async update(
    id: string,
    attrs: Partial<ExerciseSchedule>,
  ): Promise<[number, ExerciseSchedule[]]> {
    return this.exerciseScheduleModel.update(attrs, {
      where: { id },
      returning: true,
    });
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findById(id);
    if (schedule) {
      await schedule.destroy();
    }
  }
}
