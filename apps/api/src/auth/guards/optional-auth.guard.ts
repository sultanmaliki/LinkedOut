import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { getJwtSecret } from '../jwt-secret';
import { UserRepository } from '../user.repository';
import type { AuthenticatedUser } from './auth.guard';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  type?: string;
}

interface OptionalAuthRequest {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
}

// Same token check as AuthGuard, but a missing or invalid token is not an
// error here: the request still proceeds, just without `request.user` set.
// For routes that are publicly readable but return extra, viewer-specific
// data (e.g. "did I like this post?") when a valid token is present.
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly jwtSecret = getJwtSecret();

  // See AuthGuard for why this is constructed directly instead of injected.
  private readonly userRepository = new UserRepository();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return true;
    }

    let payload: AccessTokenPayload;

    try {
      payload = jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
    } catch {
      return true;
    }

    if (payload.type !== 'access' || !payload.sub || !payload.email || !payload.role) {
      return true;
    }

    const user = await this.userRepository.findStatusById(payload.sub);

    if (!user || user.status !== 'ACTIVE') {
      return true;
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      emailVerified: user.emailVerified,
    };

    return true;
  }
}
