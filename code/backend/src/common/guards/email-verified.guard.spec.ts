import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmailVerifiedGuard } from './email-verified.guard';

describe('EmailVerifiedGuard', () => {
  let guard: EmailVerifiedGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockContext = (user?: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new EmailVerifiedGuard(reflector);
  });

  it('should allow access for @Public() routes', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('should allow access for @SkipEmailVerification() routes', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'skipEmailVerification') return true;
      return undefined;
    });

    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('should allow access for verified users', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(mockContext({ isEmailVerified: true }))).toBe(true);
  });

  it('should throw ForbiddenException for unverified users', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(() =>
      guard.canActivate(mockContext({ isEmailVerified: false })),
    ).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is undefined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(() => guard.canActivate(mockContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException when user is null', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(() => guard.canActivate(mockContext(null))).toThrow(
      ForbiddenException,
    );
  });

  it('should check both handler and class for metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const ctx = mockContext({ isEmailVerified: true });
    guard.canActivate(ctx);

    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
    expect(reflector.getAllAndOverride.mock.calls[0][0]).toBe('isPublic');
    expect(reflector.getAllAndOverride.mock.calls[1][0]).toBe(
      'skipEmailVerification',
    );
  });
});
