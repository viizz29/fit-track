import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseCompletion } from './exercise-completion.model';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseSchedulesModule } from '../exercise-schedules/exercise-schedules.module';
import { ExerciseCompletionsController } from './exercise-completions.controller';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { ExerciseCompletionsRepository } from './exercise-completions.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([ExerciseCompletion, ExerciseSchedule]),
    ExerciseSchedulesModule,
  ],
  controllers: [ExerciseCompletionsController],
  providers: [ExerciseCompletionsService, ExerciseCompletionsRepository],
})
export class ExerciseCompletionsModule {}
