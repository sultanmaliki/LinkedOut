'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const common_1 = require('@nestjs/common');
const testing_1 = require('@nestjs/testing');
const auth_controller_1 = require('../auth.controller');
const auth_service_1 = require('../auth.service');
describe('AuthController', () => {
  let controller;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await testing_1.Test.createTestingModule({
      controllers: [auth_controller_1.AuthController],
      providers: [
        {
          provide: auth_service_1.AuthService,
          useValue: authService,
        },
      ],
    }).compile();
    controller = module.get(auth_controller_1.AuthController);
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
    authService.register.mockRejectedValue(
      new common_1.ConflictException('Email already registered'),
    );
    await expect(
      controller.register({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'supersecret1',
      }),
    ).rejects.toThrow('Email already registered');
  });
  it('propagates authentication errors', async () => {
    authService.login.mockRejectedValue(new common_1.UnauthorizedException('Invalid credentials'));
    await expect(
      controller.login({
        email: 'ada@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
