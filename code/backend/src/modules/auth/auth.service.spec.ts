import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { UserOtpRepository } from './user-otp.repository';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-token-hex'),
  }),
}));

jest.mock('../../util/send-email', () => ({
  MSG91: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendOtpThroughEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MSG91 } from '../../util/send-email';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let passwordResetTokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let userOtpRepository: jest.Mocked<UserOtpRepository>;

  const mockUser = {
    userId: 'user-123',
    name: 'John',
    email: 'john@test.com',
    passwordHash: 'hashed-password',
    isEmailVerified: true,
    is2faEnabled: false,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (MSG91.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
    (MSG91.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);
    (MSG91.sendOtpThroughEmail as jest.Mock).mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByVerificationToken: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: require('@nestjs/jwt').JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: PasswordResetTokenRepository,
          useValue: {
            invalidatePreviousTokens: jest.fn(),
            create: jest.fn(),
            findByToken: jest.fn(),
            markUsed: jest.fn(),
          },
        },
        {
          provide: UserOtpRepository,
          useValue: {
            create: jest.fn(),
            findValidByUserIdAndOtp: jest.fn(),
            markUsed: jest.fn(),
            invalidatePrevious: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(require('@nestjs/jwt').JwtService);
    passwordResetTokenRepository = module.get(PasswordResetTokenRepository);
    userOtpRepository = module.get(UserOtpRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and send verification email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser as any);

      const result = await service.register('John', 'john@test.com', 'pass1234');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('pass1234', 10);
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
          email: 'john@test.com',
          passwordHash: 'hashed-password',
          emailVerificationToken: 'mock-token-hex',
        }),
      );
      expect(MSG91.sendVerificationEmail).toHaveBeenCalledWith(
        'John',
        'john@test.com',
        'mock-token-hex',
      );
      expect(result).toEqual({
        message: 'Account created successfully. Please check your email to verify your account.',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        service.register('John', 'john@test.com', 'pass1234'),
      ).rejects.toThrow(ConflictException);
    });

    it('should still succeed if email sending fails', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser as any);
      (MSG91.sendVerificationEmail as jest.Mock).mockRejectedValue(
        new Error('Email service down'),
      );

      const result = await service.register('John', 'john@test.com', 'pass1234');

      expect(result).toEqual({
        message: 'Account created successfully. Please check your email to verify your account.',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      userRepository.findByVerificationToken.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
      } as any);
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.verifyEmail('valid-token');

      expect(userRepository.findByVerificationToken).toHaveBeenCalledWith('valid-token');
      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      });
      expect(result).toEqual({
        message: 'Email verified successfully. You can now log in.',
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      userRepository.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email is already verified', async () => {
      userRepository.findByVerificationToken.mockResolvedValue({
        ...mockUser,
        isEmailVerified: true,
      } as any);

      await expect(service.verifyEmail('token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired token', async () => {
      userRepository.findByVerificationToken.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
        emailVerificationTokenExpiresAt: new Date('2020-01-01'),
      } as any);

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email for unverified user', async () => {
      userRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
      } as any);
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.resendVerification('john@test.com');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(MSG91.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Verification email resent successfully. Please check your email.',
      });
    });

    it('should throw BadRequestException if email not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.resendVerification('unknown@test.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email is already verified', async () => {
      userRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        isEmailVerified: true,
      } as any);

      await expect(
        service.resendVerification('john@test.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should create reset token and send email for existing user', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetTokenRepository.invalidatePreviousTokens.mockResolvedValue();
      passwordResetTokenRepository.create.mockResolvedValue({} as any);

      const result = await service.forgotPassword('john@test.com');

      expect(passwordResetTokenRepository.invalidatePreviousTokens).toHaveBeenCalledWith(
        'user-123',
      );
      expect(passwordResetTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          token: 'mock-token-hex',
        }),
      );
      expect(MSG91.sendPasswordResetEmail).toHaveBeenCalledWith(
        'John',
        'john@test.com',
        'mock-token-hex',
      );
      expect(result).toEqual({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    });

    it('should return same success message even if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('unknown@test.com');

      expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      passwordResetTokenRepository.findByToken.mockResolvedValue({
        id: 'token-1',
        userId: 'user-123',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      } as any);
      userRepository.update.mockResolvedValue([1, []]);
      passwordResetTokenRepository.markUsed.mockResolvedValue();

      const result = await service.resetPassword('valid-token', 'newpass123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        passwordHash: 'hashed-password',
      });
      expect(passwordResetTokenRepository.markUsed).toHaveBeenCalledWith('token-1');
      expect(result).toEqual({
        message: 'Password has been reset successfully.',
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      passwordResetTokenRepository.findByToken.mockResolvedValue(null);

      await expect(
        service.resetPassword('bad-token', 'newpass123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for already used token', async () => {
      passwordResetTokenRepository.findByToken.mockResolvedValue({
        id: 'token-1',
        userId: 'user-123',
        token: 'used-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
      } as any);

      await expect(
        service.resetPassword('used-token', 'newpass123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      passwordResetTokenRepository.findByToken.mockResolvedValue({
        id: 'token-1',
        userId: 'user-123',
        token: 'expired-token',
        expiresAt: new Date('2020-01-01'),
        usedAt: null,
      } as any);

      await expect(
        service.resetPassword('expired-token', 'newpass123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return JWT token for valid credentials without 2FA', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        is2faEnabled: false,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('john@test.com', 'pass1234');

      expect(userRepository.findOne).toHaveBeenCalledWith('john@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('pass1234', 'hashed-password');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        isEmailVerified: true,
      });
      expect(result).toEqual({
        token: 'jwt-token',
        user: {
          userId: 'user-123',
          name: 'John',
          email: 'john@test.com',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login('john@test.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('john@test.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login('john@test.com', 'pass1234'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return requiresOtp and tempToken when 2FA is enabled', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        is2faEnabled: true,
        isEmailVerified: true,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('temp-2fa-token');
      userOtpRepository.invalidatePrevious.mockResolvedValue();
      userOtpRepository.create.mockResolvedValue({} as any);

      const result = await service.login('john@test.com', 'pass1234');

      expect(userOtpRepository.invalidatePrevious).toHaveBeenCalledWith(
        'user-123',
        'login_2fa',
      );
      expect(userOtpRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          type: 'login_2fa',
        }),
      );
      expect(MSG91.sendOtpThroughEmail).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-123', purpose: '2fa_login' },
        { expiresIn: '5m' },
      );
      expect(result).toEqual({
        requiresOtp: true,
        tempToken: 'temp-2fa-token',
      });
    });
  });

  describe('verifyOtpLogin', () => {
    it('should return JWT token for valid OTP', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        purpose: '2fa_login',
      });
      userOtpRepository.findValidByUserIdAndOtp.mockResolvedValue({
        id: 'otp-1',
      } as any);
      userOtpRepository.markUsed.mockResolvedValue();
      userRepository.findById.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('final-jwt-token');

      const result = await service.verifyOtpLogin('temp-token', '123456');

      expect(jwtService.verify).toHaveBeenCalledWith('temp-token');
      expect(userOtpRepository.findValidByUserIdAndOtp).toHaveBeenCalledWith(
        'user-123',
        '123456',
        'login_2fa',
      );
      expect(userOtpRepository.markUsed).toHaveBeenCalledWith('otp-1');
      expect(result).toEqual({
        token: 'final-jwt-token',
        user: {
          userId: 'user-123',
          name: 'John',
          email: 'john@test.com',
        },
      });
    });

    it('should throw UnauthorizedException for invalid temp token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(
        service.verifyOtpLogin('bad-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong token purpose', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        purpose: 'password_reset',
      });

      await expect(
        service.verifyOtpLogin('wrong-purpose-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        purpose: '2fa_login',
      });
      userOtpRepository.findValidByUserIdAndOtp.mockResolvedValue(null);

      await expect(
        service.verifyOtpLogin('temp-token', '000000'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        purpose: '2fa_login',
      });
      userOtpRepository.findValidByUserIdAndOtp.mockResolvedValue({
        id: 'otp-1',
      } as any);
      userOtpRepository.markUsed.mockResolvedValue();
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.verifyOtpLogin('temp-token', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('toggle2fa', () => {
    it('should enable 2FA', async () => {
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.toggle2fa('user-123', true);

      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        is2faEnabled: true,
      });
      expect(result).toEqual({
        message: 'Two-factor authentication enabled.',
      });
    });

    it('should disable 2FA', async () => {
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.toggle2fa('user-123', false);

      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        is2faEnabled: false,
      });
      expect(result).toEqual({
        message: 'Two-factor authentication disabled.',
      });
    });
  });
});
