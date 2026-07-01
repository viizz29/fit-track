import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateExerciseCompletionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  scheduleId: string;

  @ApiProperty({ example: '2026-07-01T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  completionDatetime?: string;
}
