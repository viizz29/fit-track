import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyExerciseStat } from './daily-exercise-stat.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';

@Injectable()
export class ExerciseStatsRepository {
  constructor(
    @InjectModel(DailyExerciseStat)
    private statModel: typeof DailyExerciseStat,
  ) {}

  async upsert(
    userId: string,
    date: string,
    exerciseTypeId: string,
    scheduledCount: number,
    completedCount: number,
  ): Promise<DailyExerciseStat> {
    const existing = await this.statModel.findOne({
      where: { userId, date, exerciseTypeId },
    });

    if (existing) {
      console.log({ existing });

      existing.scheduledCount = scheduledCount;
      existing.completedCount = completedCount;
      await existing.save();
    }

    return this.statModel.create({
      userId,
      date,
      exerciseTypeId,
      scheduledCount,
      completedCount,
    });
  }

  async hasUnfinalized(date: string): Promise<boolean> {
    const count = await this.statModel.count({
      where: { date, isFinalized: false },
    });
    return count > 0;
  }

  async finalizeDate(date: string): Promise<[number]> {
    return this.statModel.update(
      { isFinalized: true },
      { where: { date, isFinalized: false } },
    );
  }

  async findAllTimeByUser(
    userId: string,
    raw: boolean = true,
  ): Promise<DailyExerciseStat[]> {
    return this.statModel.findAll({
      where: { userId },
      include: [ExerciseType],
      raw,
    });
  }
}
