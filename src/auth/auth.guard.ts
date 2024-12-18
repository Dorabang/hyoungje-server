import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    const accessToken = this.extractAccessToken(request);
    if (!accessToken) {
      throw new UnauthorizedException({
        result: 'ERROR',
        code: 'T001',
        message: 'Access token is required.',
      });
    }

    try {
      return super.canActivate(context);
    } catch (error) {
      console.log('🚀 ~ AuthGuard ~ canActivate ~ _error:', error);
      throw new UnauthorizedException({
        result: 'ERROR',
        code: 'T002',
        message: 'Invalid access token.',
      });
    }
  }

  private extractAccessToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const accessToken = req.cookies?.access_token;

    if (accessToken) {
      req.headers.authorization = `Bearer ${accessToken}`;
    }
    return req;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          result: 'ERROR',
          message: 'Access token is required or invalid',
        })
      );
    }
    return user;
  }
}
