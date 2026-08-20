import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  type?: string;
}

interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    let payload: AccessTokenPayload;

    try {
      payload = jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Refresh token cannot be used as an access token');
    }

    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return true;
  }
}
