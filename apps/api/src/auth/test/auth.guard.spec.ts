import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { AuthGuard } from '../guards/auth.guard';

describe('AuthGuard', () => {
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

  it('accepts a valid access token', () => {
    const token = jwt.sign(
      {
        sub: 'user-1',
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
      },
      'dev-secret',
    );

    const { context, request } = createContext(`Bearer ${token}`);

    expect(guard.canActivate(context)).toBe(true);

    expect(request.user).toEqual({
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
    });
  });

  it('rejects a missing authorization header', () => {
    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Authorization header is required'),
    );
  });

  it('rejects an invalid authorization header', () => {
    const { context } = createContext('Basic abc123');

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Invalid authorization header'),
    );
  });

  it('rejects an invalid access token', () => {
    const { context } = createContext('Bearer not-a-real-token');

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Invalid access token'),
    );
  });

  it('rejects a refresh token', () => {
    const token = jwt.sign(
      {
        sub: 'user-1',
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
        type: 'refresh',
      },
      'dev-secret',
    );

    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Refresh token cannot be used as an access token'),
    );
  });

  it('rejects a token with missing claims', () => {
    const token = jwt.sign(
      {
        email: 'ada@example.com',
        role: 'PROFESSIONAL',
      },
      'dev-secret',
    );

    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Invalid access token'),
    );
  });
});
