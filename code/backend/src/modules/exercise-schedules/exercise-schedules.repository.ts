import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ExerciseSchedule } from './exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { CreateExerciseScheduleDto } from './dto/create-exercise-schedule.dto';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
    const attrs: any = { ...dto, userId };
    if (dto.recurrenceType === 'DAILY') {
      delete attrs.weekdays;
    }
    return this.exerciseScheduleModel.create(attrs);
  }

  async findAllByUser(
    userId: string,
    raw: boolean = true,
  ): Promise<ExerciseSchedule[]> {
    return this.exerciseScheduleModel.findAll({
      where: { userId },
      include: [ExerciseType],
      raw,
    });
  }

  async findByDate(
    userId: string,
    date: string,
  ): Promise<(ExerciseSchedule & { completed: boolean })[]> {
    const schedules = await this.findAllByUser(userId);
    const { active, completedSet } =
      await this.getActiveSchedulesWithCompletion(schedules, date);

    return active.map((schedule) => ({
      ...schedule,
      completed: completedSet.has(schedule.id),
    })) as (ExerciseSchedule & { completed: boolean })[];
  }

  private async getActiveSchedulesWithCompletion(
    schedules: ExerciseSchedule[],
    date: string,
  ): Promise<{ active: ExerciseSchedule[]; completedSet: Set<string> }> {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const dayEnd = new Date(target);
    dayEnd.setHours(23, 59, 59, 999);

    const active = schedules.filter((schedule) => {
      const start = new Date(schedule.startDatetime);
      start.setHours(0, 0, 0, 0);
      if (target < start) return false;

      switch (schedule.recurrenceType) {
        case 'DAILY':
          return true;
        case 'WEEKLY': {
          if (!schedule.weekdays || schedule.weekdays.length === 0)
            return false;
          return schedule.weekdays.includes(DAY_NAMES[target.getDay()]);
        }
        default:
          return false;
      }
    });

    const activeIds = active.map((s) => s.id);

    const completions = await this.exerciseCompletionModel.findAll({
      where: {
        schedule_id: { [Op.in]: activeIds },
        completionDatetime: {
          [Op.gte]: target,
          [Op.lte]: dayEnd,
        },
      },
      raw: true,
    });

    const completedSet = new Set(completions.map((c) => c.scheduleId));

    return { active, completedSet };
  }

  async findWeekList(
    userId: string,
    weekStart: string,
    weekEnd: string,
  ): Promise<{
    weekStart: string;
    weekEnd: string;
    days: {
      date: string;
      dayOfWeek: string;
      exercises: {
        id: string;
        recurrenceType: string;
        weekdays: string[] | null;
        startDatetime: Date;
        timezone: string;
        completed: boolean;
        exerciseType: { id: string; name: string; description: string | null };
      }[];
    }[];
  }> {
    const startDate = new Date(weekStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(weekEnd);
    endDate.setHours(23, 59, 59, 999);

    const days: {
      date: string;
      dayOfWeek: string;
      exercises: {
        id: string;
        recurrenceType: string;
        weekdays: string[] | null;
        startDatetime: Date;
        timezone: string;
        completed: boolean;
        exerciseType: { id: string; name: string; description: string | null };
      }[];
    }[] = [];

    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = DAY_NAMES[current.getDay()];

      const exercises = await this.findByDate(userId, dateStr);
      days.push({ date: dateStr, dayOfWeek, exercises });
      current.setDate(current.getDate() + 1);
    }

    return { weekStart, weekEnd, days };
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
