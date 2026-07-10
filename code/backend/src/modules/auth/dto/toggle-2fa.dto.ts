import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class Toggle2faDto {
  @ApiProperty({
    description: 'Enable or disable two-factor authentication',
  })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;
}
