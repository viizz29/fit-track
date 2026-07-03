import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ExerciseCompletion } from './exercise-completion.model';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { QueryExerciseCompletionDto } from './dto/query-exercise-completion.dto';

@Injectable()
export class ExerciseCompletionsRepository {
  constructor(
    @InjectModel(ExerciseCompletion)
    private exerciseCompletionModel: typeof ExerciseCompletion,
  ) {}

  async create(dto: CreateExerciseCompletionDto): Promise<ExerciseCompletion> {
    const payload: any = { scheduleId: dto.scheduleId };
    if (dto.completionDatetime) {
      payload.completionDatetime = dto.completionDatetime;
    }
    return this.exerciseCompletionModel.create(payload);
  }

  async findAllByUser(
    userId: string,
    filters: QueryExerciseCompletionDto,
  ): Promise<ExerciseCompletion[]> {
    const where: any = {};
    const scheduleWhere: any = { user_id: userId };

    if (filters.scheduleId) {
      where.scheduleId = filters.scheduleId;
    }
    if (filters.startDate || filters.endDate) {
      where.completionDatetime = {};
      if (filters.startDate) {
        where.completionDatetime[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        where.completionDatetime[Op.lte] = filters.endDate;
      }
    }

    return this.exerciseCompletionModel.findAll({
      where,
      include: [
        {
          model: ExerciseSchedule,
          where: scheduleWhere,
          required: true,
          include: [ExerciseType],
        },
      ],
    });
  }

  async findById(id: string): Promise<ExerciseCompletion | null> {
    return this.exerciseCompletionModel.findByPk(id, {
      include: [ExerciseSchedule],
    });
  }

  async remove(id: string): Promise<void> {
    const completion = await this.findById(id);
    if (completion) {
      await completion.destroy();
    }
  }
}
