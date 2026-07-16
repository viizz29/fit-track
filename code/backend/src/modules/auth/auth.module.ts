import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/lib/jwt-strategy';
import { PasswordResetToken } from './password-reset-token.model';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { UserOtp } from './user-otp.model';
import { UserOtpRepository } from './user-otp.repository';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    SequelizeModule.forFeature([PasswordResetToken, UserOtp]),
    // JWT Setup
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PasswordResetTokenRepository,
    UserOtpRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
