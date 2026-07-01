import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExerciseTypesRepository } from './exercise-types.repository';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

@Injectable()
export class ExerciseTypesService {
  constructor(
    private readonly exerciseTypesRepository: ExerciseTypesRepository,
  ) {}

  async create(dto: CreateExerciseTypeDto, userId: string) {
    const existing = await this.exerciseTypesRepository.findByName(
      dto.name,
      userId,
    );
    if (existing) {
      throw new ConflictException('Exercise type already exists');
    }
    return this.exerciseTypesRepository.create(dto, userId);
  }

  async findAll(userId: string) {
    return this.exerciseTypesRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    const exerciseType = await this.exerciseTypesRepository.findById(id);
    if (!exerciseType) {
      throw new NotFoundException('Exercise type not found');
    }

    if (exerciseType.get('userId') !== userId) {
      throw new NotFoundException('Exercise type not found 2');
    }
    return exerciseType;
  }

  async update(id: string, dto: UpdateExerciseTypeDto, userId: string) {
    await this.findOne(id, userId);
    await this.exerciseTypesRepository.update(id, dto);
    return this.exerciseTypesRepository.findById(id);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.exerciseTypesRepository.remove(id);
  }
}
