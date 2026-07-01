import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [SequelizeModule.forFeature([ExerciseSchedule, ExerciseCompletion])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
