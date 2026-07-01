import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  MaxLength,
} from 'class-validator';

export enum RecurrenceType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export class CreateExerciseScheduleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  exerciseTypeId: string;

  @ApiProperty({ enum: RecurrenceType, example: RecurrenceType.DAILY })
  @IsEnum(RecurrenceType)
  recurrenceType: RecurrenceType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  recurrenceInterval: number;

  @ApiProperty({ example: '2026-07-01T08:00:00Z' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  timezone: string;
}
