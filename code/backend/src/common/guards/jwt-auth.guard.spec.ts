import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;
  let originalBaseUrl: string | undefined;

  const mockContext = (path: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          route: { path },
          url: path,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    originalBaseUrl = process.env.API_BASE_URL;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    configService = {} as any;

    guard = new JwtAuthGuard(reflector, configService);
  });

  afterEach(() => {
    if (originalBaseUrl !== undefined) {
      process.env.API_BASE_URL = originalBaseUrl;
    } else {
      delete process.env.API_BASE_URL;
    }
  });

  it('should allow access for @Public() routes', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    const result = guard.canActivate(mockContext('/test1'));

    expect(result).toBe(true);
  });

  it('should allow access for auth routes without API_BASE_URL', () => {
    delete process.env.API_BASE_URL;
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext('/v1/auth/login'));

    expect(result).toBe(true);
  });

  it('should allow access for auth routes with API_BASE_URL', () => {
    process.env.API_BASE_URL = 'api/v1';
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext('/api/v1/v1/auth/login'));

    expect(result).toBe(true);
  });

  it('should allow access for auth register route', () => {
    delete process.env.API_BASE_URL;
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext('/v1/auth/register'));

    expect(result).toBe(true);
  });

  it('should allow access for auth verify-email route', () => {
    delete process.env.API_BASE_URL;
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext('/v1/auth/verify-email'));

    expect(result).toBe(true);
  });

  it('should delegate to parent for non-public, non-auth routes', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);

    const ctx = mockContext('/v1/users/me');
    guard.canActivate(ctx);

    expect(superCanActivate).toHaveBeenCalled();
  });

  it('should check both handler and class for @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    guard.canActivate(mockContext('/anything'));

    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    expect(reflector.getAllAndOverride.mock.calls[0][0]).toBe('isPublic');
  });

  it('should not allow non-auth routes without valid JWT', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(false);

    const result = guard.canActivate(mockContext('/v1/users/me'));

    expect(result).toBe(false);
  });
});
