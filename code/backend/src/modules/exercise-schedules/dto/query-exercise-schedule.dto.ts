import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class QueryExerciseScheduleDto {
  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  date: string;
}
