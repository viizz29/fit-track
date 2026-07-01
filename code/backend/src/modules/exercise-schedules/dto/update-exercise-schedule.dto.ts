import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseScheduleDto } from './create-exercise-schedule.dto';

export class UpdateExerciseScheduleDto extends PartialType(
  CreateExerciseScheduleDto,
) {}
