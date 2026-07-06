import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Public } from 'src/common/decorators/public.decorator';

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
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Return JWT access token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  login(@Body() body: LoginDto) {
    console.log({ body });
    return this.authService.login(body.email, body.password);
  }
}
