import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { getJwtSecret } from '../jwt-secret';
import { UserRepository } from '../user.repository';

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
  private readonly jwtSecret = getJwtSecret();

  // Deliberately not constructor-injected: AuthGuard is applied via
  // @UseGuards(AuthGuard) across ~30 controllers in as many modules, and
  // Nest resolves a guard's constructor params against whatever module
  // compiled it. A constructor dependency here would require every one of
  // those modules (and every isolated controller-only test module) to
  // provide UserRepository. UserRepository itself has no constructor
  // dependencies (it talks to the shared `db` singleton directly), so
  // constructing it locally is safe and side-effect-free.
  private readonly userRepository = new UserRepository();

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // Allowlist: only tokens explicitly minted for API access are accepted.
    // This rejects any other correctly-signed token purpose (e.g. an
    // email-verification token) even if it happens to carry sub/email/role.
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.userRepository.findStatusById(payload.sub);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return true;
  }
}
