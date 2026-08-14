'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const drizzle_orm_1 = require('drizzle-orm');
const database_1 = require('@linkedout/database');
const auth_service_1 = require('../auth.service');
const user_repository_1 = require('../user.repository');
const TEST_EMAIL = 'ada@example.com';
describe('AuthService', () => {
  beforeEach(async () => {
    await database_1.db
      .delete(database_1.users)
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
  });
  afterAll(async () => {
    await database_1.db
      .delete(database_1.users)
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
    await database_1.client.end();
  });
  it('registers a new user and persists the professional profile', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    const result = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.user.name).toBe('Ada');
    expect(result.user.role).toBe('PROFESSIONAL');
    const [user] = await database_1.db
      .select({
        id: database_1.users.id,
        email: database_1.users.email,
        role: database_1.users.role,
      })
      .from(database_1.users)
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL))
      .limit(1);
    expect(user).toBeDefined();
    expect(user?.email).toBe(TEST_EMAIL);
    expect(user?.role).toBe('PROFESSIONAL');
    const [profile] = await database_1.db
      .select({
        userId: database_1.professionalProfiles.userId,
        fullName: database_1.professionalProfiles.fullName,
      })
      .from(database_1.professionalProfiles)
      .where((0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, user.id))
      .limit(1);
    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(user.id);
    expect(profile?.fullName).toBe('Ada');
  });
  it('rejects invalid login credentials', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
  it('logs in with valid persisted credentials', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    const result = await service.login({
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.user.name).toBe('Ada');
    expect(result.user.role).toBe('PROFESSIONAL');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });
  it('refreshes tokens with a valid refresh token', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    const registered = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    const result = await service.refresh({
      refreshToken: registered.refreshToken,
    });
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.user.name).toBe('Ada');
    expect(result.user.role).toBe('PROFESSIONAL');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });
  it('rejects duplicate registration', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    await expect(
      service.register({
        name: 'Another Ada',
        email: TEST_EMAIL,
        password: 'anotherpassword',
      }),
    ).rejects.toThrow('Email already registered');
  });
  it('rejects an invalid refresh token', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await expect(
      service.refresh({
        refreshToken: 'not-a-real-token',
      }),
    ).rejects.toThrow();
  });
  it('rejects a refresh token when the user no longer exists', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    const registered = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    await database_1.db
      .delete(database_1.users)
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
    await expect(
      service.refresh({
        refreshToken: registered.refreshToken,
      }),
    ).rejects.toThrow('Invalid refresh token');
  });
  it.each(['DEACTIVATED', 'SUSPENDED', 'BANNED'])(
    'rejects login for a %s account',
    async (status) => {
      const repository = new user_repository_1.UserRepository();
      const service = new auth_service_1.AuthService(repository);
      await service.register({
        name: 'Ada',
        email: TEST_EMAIL,
        password: 'supersecret1',
      });
      await database_1.db
        .update(database_1.users)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
      await expect(
        service.login({
          email: TEST_EMAIL,
          password: 'supersecret1',
        }),
      ).rejects.toThrow('Account is not active');
    },
  );
  it('allows login for an active account', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    await database_1.db
      .update(database_1.users)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
    const result = await service.login({
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });
  it('rejects refresh for a non-active account', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    const registered = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });
    await database_1.db
      .update(database_1.users)
      .set({
        status: 'SUSPENDED',
        updatedAt: new Date(),
      })
      .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
    await expect(
      service.refresh({
        refreshToken: registered.refreshToken,
      }),
    ).rejects.toThrow('Account is not active');
  });
});
