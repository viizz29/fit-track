import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExerciseTypeDto {
  @ApiProperty({ example: 'Running' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Outdoor running session', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
