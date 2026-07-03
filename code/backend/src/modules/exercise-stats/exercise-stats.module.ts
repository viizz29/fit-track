import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyExerciseStat } from './daily-exercise-stat.model';
import { User } from '../users/user.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { ExerciseSchedulesModule } from '../exercise-schedules/exercise-schedules.module';
import { ExerciseStatsController } from './exercise-stats.controller';
import { ExerciseStatsService } from './exercise-stats.service';
import { ExerciseStatsRepository } from './exercise-stats.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([DailyExerciseStat, User, ExerciseCompletion]),
    ExerciseSchedulesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ExerciseStatsController],
  providers: [ExerciseStatsService, ExerciseStatsRepository],
})
export class ExerciseStatsModule {}
