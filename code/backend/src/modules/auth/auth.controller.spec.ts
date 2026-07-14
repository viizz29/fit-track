import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            verifyEmail: jest.fn(),
            resendVerification: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            login: jest.fn(),
            verifyOtpLogin: jest.fn(),
            toggle2fa: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test', () => {
    it('should return "auth test"', () => {
      expect(controller.test()).toBe('auth test');
    });
  });

  describe('register', () => {
    it('should call authService.register with correct args', async () => {
      const dto = { name: 'John', email: 'john@test.com', password: 'pass1234' };
      const expected = { message: 'Account created successfully. Please check your email to verify your account.' };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith('John', 'john@test.com', 'pass1234');
      expect(result).toEqual(expected);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail with token', async () => {
      const dto = { token: 'abc123' };
      const expected = { message: 'Email verified successfully. You can now log in.' };
      authService.verifyEmail.mockResolvedValue(expected);

      const result = await controller.verifyEmail(dto);

      expect(authService.verifyEmail).toHaveBeenCalledWith('abc123');
      expect(result).toEqual(expected);
    });
  });

  describe('resendVerification', () => {
    it('should call authService.resendVerification with email', async () => {
      const dto = { email: 'john@test.com' };
      const expected = { message: 'Verification email resent successfully. Please check your email.' };
      authService.resendVerification.mockResolvedValue(expected);

      const result = await controller.resendVerification(dto);

      expect(authService.resendVerification).toHaveBeenCalledWith('john@test.com');
      expect(result).toEqual(expected);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with email', async () => {
      const dto = { email: 'john@test.com' };
      const expected = { message: 'If an account with that email exists, a password reset link has been sent.' };
      authService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith('john@test.com');
      expect(result).toEqual(expected);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with token and password', async () => {
      const dto = { token: 'reset-token', password: 'newpass123' };
      const expected = { message: 'Password has been reset successfully.' };
      authService.resetPassword.mockResolvedValue(expected);

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'newpass123');
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password', async () => {
      const dto = { email: 'john@test.com', password: 'pass1234' };
      const expected = { token: 'jwt-token', user: { userId: '1', name: 'John', email: 'john@test.com' } };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith('john@test.com', 'pass1234');
      expect(result).toEqual(expected);
    });

    it('should propagate login errors', async () => {
      const dto = { email: 'john@test.com', password: 'wrong' };
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyOtpLogin', () => {
    it('should call authService.verifyOtpLogin with tempToken and otp', async () => {
      const dto = { tempToken: 'temp-jwt', otp: '123456' };
      const expected = { token: 'jwt-token', user: { userId: '1', name: 'John', email: 'john@test.com' } };
      authService.verifyOtpLogin.mockResolvedValue(expected);

      const result = await controller.verifyOtpLogin(dto);

      expect(authService.verifyOtpLogin).toHaveBeenCalledWith('temp-jwt', '123456');
      expect(result).toEqual(expected);
    });
  });

  describe('toggle2fa', () => {
    it('should call authService.toggle2fa with userId and enabled', async () => {
      const user = { userId: 'user-123' };
      const dto = { enabled: true };
      const expected = { message: 'Two-factor authentication enabled.' };
      authService.toggle2fa.mockResolvedValue(expected);

      const result = await controller.toggle2fa(dto, user);

      expect(authService.toggle2fa).toHaveBeenCalledWith('user-123', true);
      expect(result).toEqual(expected);
    });

    it('should handle disable 2fa', async () => {
      const user = { userId: 'user-123' };
      const dto = { enabled: false };
      const expected = { message: 'Two-factor authentication disabled.' };
      authService.toggle2fa.mockResolvedValue(expected);

      const result = await controller.toggle2fa(dto, user);

      expect(authService.toggle2fa).toHaveBeenCalledWith('user-123', false);
      expect(result).toEqual(expected);
    });
  });
});
