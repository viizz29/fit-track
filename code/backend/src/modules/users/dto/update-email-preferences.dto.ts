import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateEmailPreferencesDto {
  @ApiProperty({
    example: true,
    description: 'Enable or disable email notifications',
  })
  @IsBoolean()
  emailNotifications!: boolean;
}
