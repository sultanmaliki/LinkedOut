import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../auth/guards/auth.guard';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class ModeratorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const role = request.user?.role;

    if (role !== 'MODERATOR' && role !== 'ADMIN') {
      throw new ForbiddenException('Moderator access required');
    }

    return true;
  }
}
