import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  MaxLength,
  ValidateIf,
  ArrayUnique,
} from 'class-validator';

export const VALID_WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type Weekday = (typeof VALID_WEEKDAYS)[number];

export enum RecurrenceType {
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

  @ApiProperty({
    example: ['MON', 'WED', 'FRI'],
    description: 'Required when recurrenceType is WEEKLY. Valid values: MON, TUE, WED, THU, FRI, SAT, SUN',
  })
  @ValidateIf(o => o.recurrenceType === RecurrenceType.WEEKLY)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  weekdays?: string[];

  @ApiProperty({ example: '2026-07-01T08:00:00Z' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  timezone: string;
}
