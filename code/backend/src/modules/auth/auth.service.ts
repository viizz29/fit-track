import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRepository } from '../users/users.repository';
import { MSG91 } from 'src/util/send-email';
import { VERIFICATION_TOKEN_EXPIRY_HOURS } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    const user = await this.userRepository.create({
      name,
      email,
      passwordHash: hash,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    try {
      await MSG91.sendVerificationEmail(name, email, verificationToken);
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return {
      message:
        'Account created successfully. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      new Date() > user.emailVerificationTokenExpiresAt
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new one.',
      );
    }

    await this.userRepository.update(user.userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    await this.userRepository.update(user.userId, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    try {
      await MSG91.sendVerificationEmail(
        user.name,
        user.email,
        verificationToken,
      );
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return {
      message:
        'Verification email resent successfully. Please check your email.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const userDetails = {
      userId: user.userId,
      name: user.name,
      email: user.email,
    };

    return {
      token: this.jwtService.sign({ sub: user.userId }),
      user: userDetails,
    };
  }
}
