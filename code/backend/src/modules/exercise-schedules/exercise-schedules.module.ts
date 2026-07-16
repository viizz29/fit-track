import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseSchedule } from './exercise-schedule.model';
import { ExerciseType } from '../exercise-types/exercise-type.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { ExerciseSchedulesController } from './exercise-schedules.controller';
import { ExerciseSchedulesService } from './exercise-schedules.service';
import { ExerciseSchedulesRepository } from './exercise-schedules.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ExerciseSchedule,
      ExerciseType,
      ExerciseCompletion,
    ]),
  ],
  controllers: [ExerciseSchedulesController],
  providers: [ExerciseSchedulesService, ExerciseSchedulesRepository],
  exports: [ExerciseSchedulesRepository],
})
export class ExerciseSchedulesModule {}
