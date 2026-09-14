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

  it('verifies an email', async () => {
    authService.verifyEmail.mockResolvedValue({ verified: true });

    await expect(controller.verifyEmail({ token: 'a-token' })).resolves.toEqual({
      verified: true,
    });
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
    };

    authService.resendVerification.mockResolvedValue({ sent: true });

    await expect(controller.resendVerification(user)).resolves.toEqual({ sent: true });
    expect(authService.resendVerification).toHaveBeenCalledWith('user-1');
  });
});
