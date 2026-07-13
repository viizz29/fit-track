import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const { API_BASE_URL } = process.env;

    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.url;

    const authPrefix = `${API_BASE_URL ? '/' + API_BASE_URL : ''}/v1/auth`;
    if (path.startsWith(authPrefix)) {
      return true;
    }

    return super.canActivate(context);
  }
}
