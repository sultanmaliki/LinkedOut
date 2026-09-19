import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { AuthGuard } from '../guards/auth.guard';
import { getJwtSecret } from '../jwt-secret';
import { UserRepository } from '../user.repository';

describe('AuthGuard', () => {
  // AuthGuard constructs its own UserRepository internally (see the guard's
  // comment for why it can't be constructor-injected), so status lookups
  // are stubbed at the prototype level instead of via the constructor.
  const findStatusById = jest.spyOn(UserRepository.prototype, 'findStatusById');

  const guard = new AuthGuard();

  const createContext = (authorization?: string) => {
    const request: {
      headers: {
        authorization?: string;
      };
      user?: {
        id: string;
        email: string;
        role: string;
        emailVerified: boolean;
      };
    } = {
      headers: {
        authorization,
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    return { context, request };
  };

  const signAccessToken = (overrides: Record<string, unknown> = {}) =>
    jwt.sign(
      {
        sub: 'user-1',
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
        type: 'access',
        ...overrides,
      },
      getJwtSecret(),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    findStatusById.mockResolvedValue({ status: 'ACTIVE', emailVerified: false });
  });

  it('accepts a valid access token for an active user', async () => {
    const { context, request } = createContext(`Bearer ${signAccessToken()}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(request.user).toEqual({
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: false,
    });
  });

  it('carries emailVerified: true through onto request.user for a verified account', async () => {
    findStatusById.mockResolvedValue({ status: 'ACTIVE', emailVerified: true });

    const { context, request } = createContext(`Bearer ${signAccessToken()}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user?.emailVerified).toBe(true);
  });

  it('rejects a missing authorization header', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization header is required'),
    );
  });

  it('rejects an invalid authorization header', async () => {
    const { context } = createContext('Basic abc123');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid authorization header'),
    );
  });

  it('rejects an invalid access token', async () => {
    const { context } = createContext('Bearer not-a-real-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid access token'),
    );
  });

  it('rejects a refresh token', async () => {
    const token = jwt.sign(
      {
        sub: 'user-1',
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
        type: 'refresh',
      },
      getJwtSecret(),
    );

    const { context } = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Refresh token cannot be used as an access token'),
    );
  });

  it('rejects a token of a different purpose that still carries sub/email/role (allowlist gap)', async () => {
    const token = signAccessToken({ type: 'email-verification' });
    const { context } = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid access token'),
    );

    expect(findStatusById).not.toHaveBeenCalled();
  });

  it('rejects a token with no type claim at all', async () => {
    const token = jwt.sign(
      {
        sub: 'user-1',
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
      },
      getJwtSecret(),
    );

    const { context } = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid access token'),
    );
  });

  it('rejects a token with missing claims', async () => {
    const token = jwt.sign(
      {
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
        type: 'access',
      },
      getJwtSecret(),
    );

    const { context } = createContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid access token'),
    );
  });

  it('rejects a token for a user that is no longer active', async () => {
    findStatusById.mockResolvedValue({ status: 'SUSPENDED', emailVerified: false });

    const { context } = createContext(`Bearer ${signAccessToken()}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Account is not active'),
    );
  });

  it('rejects a token for a user that no longer exists', async () => {
    findStatusById.mockResolvedValue(undefined);

    const { context } = createContext(`Bearer ${signAccessToken()}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Account is not active'),
    );
  });
});
