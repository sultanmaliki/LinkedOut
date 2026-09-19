import { ConflictException, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthenticatedUser } from '../guards/auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('registers a user', async () => {
    const response = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    authService.register.mockResolvedValue(response);

    await expect(
      controller.register({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'supersecret1',
      }),
    ).resolves.toEqual(response);

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'supersecret1',
    });
  });

  it('logs in a user', async () => {
    const response = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    authService.login.mockResolvedValue(response);

    await expect(
      controller.login({
        email: 'ada@example.com',
        password: 'supersecret1',
      }),
    ).resolves.toEqual(response);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'supersecret1',
    });
  });

  it('refreshes tokens', async () => {
    const response = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    authService.refresh.mockResolvedValue(response);

    await expect(
      controller.refresh({
        refreshToken: 'refresh-token',
      }),
    ).resolves.toEqual(response);

    expect(authService.refresh).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
    });
  });

  it('propagates duplicate registration errors', async () => {
    authService.register.mockRejectedValue(new ConflictException('Email already registered'));

    await expect(
      controller.register({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'supersecret1',
      }),
    ).rejects.toThrow('Email already registered');
  });

  it('propagates authentication errors', async () => {
    authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

    await expect(
      controller.login({
        email: 'ada@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('verifies an email and returns a fresh session', async () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.verifyEmail.mockResolvedValue(session);

    await expect(controller.verifyEmail({ token: 'a-token' })).resolves.toEqual(session);
    expect(authService.verifyEmail).toHaveBeenCalledWith({ token: 'a-token' });
  });

  it('propagates verification errors', async () => {
    authService.verifyEmail.mockRejectedValue(
      new UnauthorizedException('Invalid or expired verification link'),
    );

    await expect(controller.verifyEmail({ token: 'bad-token' })).rejects.toThrow(
      'Invalid or expired verification link',
    );
  });

  it('resends a verification email for the authenticated user', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };

    authService.resendVerification.mockResolvedValue({ sent: true });

    await expect(controller.resendVerification(user)).resolves.toEqual({ sent: true });
    expect(authService.resendVerification).toHaveBeenCalledWith('user-1');
  });

  it('requests a password reset', async () => {
    authService.forgotPassword.mockResolvedValue({ sent: true });

    await expect(controller.forgotPassword({ email: 'ada@example.com' })).resolves.toEqual({
      sent: true,
    });
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'ada@example.com' });
  });

  it('resets a password and returns a fresh session', async () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.resetPassword.mockResolvedValue(session);

    await expect(
      controller.resetPassword({ token: 'reset-token', newPassword: 'brandnewpass1' }),
    ).resolves.toEqual(session);
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'reset-token',
      newPassword: 'brandnewpass1',
    });
  });

  it('propagates invalid reset token errors', async () => {
    authService.resetPassword.mockRejectedValue(
      new UnauthorizedException('Invalid or expired reset link'),
    );

    await expect(
      controller.resetPassword({ token: 'bad-token', newPassword: 'brandnewpass1' }),
    ).rejects.toThrow('Invalid or expired reset link');
  });

  it('changes the password for the authenticated user', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };
    const session = {
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada',
        role: 'PROFESSIONAL',
        emailVerified: true,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authService.changePassword.mockResolvedValue(session);

    await expect(
      controller.changePassword(user, {
        currentPassword: 'oldpassword1',
        newPassword: 'brandnewpass1',
      }),
    ).resolves.toEqual(session);
    expect(authService.changePassword).toHaveBeenCalledWith('user-1', {
      currentPassword: 'oldpassword1',
      newPassword: 'brandnewpass1',
    });
  });

  it('propagates incorrect current password errors', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };
    authService.changePassword.mockRejectedValue(
      new UnauthorizedException('Current password is incorrect'),
    );

    await expect(
      controller.changePassword(user, {
        currentPassword: 'wrong',
        newPassword: 'brandnewpass1',
      }),
    ).rejects.toThrow('Current password is incorrect');
  });
});
