import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsIn } from 'class-validator';

export class CompletionsQueryDto {
  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-01T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'day' })
  @IsString()
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  period?: string;
}

export class MissedQueryDto {
  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-01T23:59:59Z' })
  @IsDateString()
  endDate: string;
}

export class CompletionRateQueryDto {
  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-01T23:59:59Z' })
  @IsDateString()
  endDate: string;
}
