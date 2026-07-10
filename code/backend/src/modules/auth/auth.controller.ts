import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpLoginDto } from './dto/verify-otp-login.dto';
import { Toggle2faDto } from './dto/toggle-2fa.dto';
import {
  Public,
  SkipEmailVerification,
} from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('test')
  getHello(): string {
    return 'auth test';
  }

  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Account created, verification email sent.',
  })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Public()
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification email resent.' })
  @ApiResponse({
    status: 400,
    description: 'No account found or already verified.',
  })
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists.' })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Return JWT access token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  login(@Body() body: LoginDto) {
    console.log({ body });
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @ApiOperation({ summary: 'Verify OTP for 2FA login step 2' })
  @ApiBody({ type: VerifyOtpLoginDto })
  @ApiResponse({ status: 200, description: 'Return JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP.' })
  @Post('verify-otp-login')
  verifyOtpLogin(@Body() dto: VerifyOtpLoginDto) {
    return this.authService.verifyOtpLogin(dto.tempToken, dto.otp);
  }

  @SkipEmailVerification()
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Enable or disable two-factor authentication' })
  @ApiBody({ type: Toggle2faDto })
  @ApiResponse({ status: 200, description: '2FA setting updated.' })
  @Post('toggle-2fa')
  toggle2fa(
    @Body() dto: Toggle2faDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.authService.toggle2fa(user.userId, dto.enabled);
  }
}
