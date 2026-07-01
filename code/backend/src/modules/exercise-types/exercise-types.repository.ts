import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExerciseType } from './exercise-type.model';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';

@Injectable()
export class ExerciseTypesRepository {
  constructor(
    @InjectModel(ExerciseType)
    private exerciseTypeModel: typeof ExerciseType,
  ) {}

  async findByName(
    name: string,
    userId: string,
  ): Promise<ExerciseType | null> {
    return this.exerciseTypeModel.findOne({
      where: { name, userId },
    });
  }

  async create(
    dto: CreateExerciseTypeDto,
    userId: string,
  ): Promise<ExerciseType> {
    return this.exerciseTypeModel.create({ ...dto, userId: userId } as any);
  }

  async findAllByUser(userId: string): Promise<ExerciseType[]> {
    return this.exerciseTypeModel.findAll({
      where: { userId: userId },
      attributes: [
        'id',
        'userId',
        'name',
        'description',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findById(id: string): Promise<ExerciseType | null> {
    return this.exerciseTypeModel.findByPk(id);
  }

  async update(
    id: string,
    attrs: Partial<ExerciseType>,
  ): Promise<[number, ExerciseType[]]> {
    return this.exerciseTypeModel.update(attrs, {
      where: { id },
      returning: true,
    });
  }

  async remove(id: string): Promise<void> {
    const exerciseType = await this.findById(id);
    if (exerciseType) {
      await exerciseType.destroy();
    }
  }
}
