import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseCompletionsRepository } from './exercise-completions.repository';
import { ExerciseSchedulesRepository } from '../exercise-schedules/exercise-schedules.repository';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { QueryExerciseCompletionDto } from './dto/query-exercise-completion.dto';

@Injectable()
export class ExerciseCompletionsService {
  constructor(
    private readonly exerciseCompletionsRepository: ExerciseCompletionsRepository,
    private readonly exerciseSchedulesRepository: ExerciseSchedulesRepository,
  ) {}

  async create(dto: CreateExerciseCompletionDto, userId: string) {
    const schedule = await this.exerciseSchedulesRepository.findById(
      dto.scheduleId,
    );
    if (!schedule || schedule.get('userId') !== userId) {
      throw new NotFoundException('Schedule not found');
    }
    return this.exerciseCompletionsRepository.create(dto);
  }

  async findAll(userId: string, filters: QueryExerciseCompletionDto) {
    return this.exerciseCompletionsRepository.findAllByUser(userId, filters);
  }

  async findOne(id: string, userId: string) {
    const completion = await this.exerciseCompletionsRepository.findById(id);
    if (!completion) {
      throw new NotFoundException('Completion not found');
    }
    if (completion.schedule.userId !== userId) {
      throw new NotFoundException('Completion not found');
    }
    return completion;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.exerciseCompletionsRepository.remove(id);
  }
}
