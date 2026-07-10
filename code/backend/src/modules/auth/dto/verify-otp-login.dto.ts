import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpLoginDto {
  @ApiProperty({
    description: 'Temporary token from login step 1',
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP sent to email',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
