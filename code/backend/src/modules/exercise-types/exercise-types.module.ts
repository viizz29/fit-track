import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseType } from './exercise-type.model';
import { ExerciseTypesController } from './exercise-types.controller';
import { ExerciseTypesService } from './exercise-types.service';
import { ExerciseTypesRepository } from './exercise-types.repository';

@Module({
  imports: [SequelizeModule.forFeature([ExerciseType])],
  controllers: [ExerciseTypesController],
  providers: [ExerciseTypesService, ExerciseTypesRepository],
  exports: [ExerciseTypesRepository],
})
export class ExerciseTypesModule {}
