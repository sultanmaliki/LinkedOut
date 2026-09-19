import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from './auth.guard';

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

// Gates actions that commit content or a decision to other users (posting a
// job, applying to one, publishing a review, ...). Must run after AuthGuard
// (or OptionalAuthGuard) on the same route so request.user is populated --
// it does not authenticate on its own.
@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user?.emailVerified) {
      throw new ForbiddenException('Verify your email address to do this');
    }

    return true;
  }
}
