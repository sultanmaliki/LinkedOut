import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { VerifiedEmailGuard } from '../guards/verified-email.guard';

describe('VerifiedEmailGuard', () => {
  const guard = new VerifiedEmailGuard();

  const createContext = (user?: { emailVerified: boolean }) => {
    const request = { user };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  it('allows a request from a verified user', () => {
    const context = createContext({ emailVerified: true });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request from an unverified user', () => {
    const context = createContext({ emailVerified: false });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Verify your email address to do this'),
    );
  });

  it('rejects a request with no user on it', () => {
    const context = createContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Verify your email address to do this'),
    );
  });
});
