import { eq } from 'drizzle-orm';

import { client, db, professionalProfiles, users } from '@linkedout/database';

import { AuthService } from '../auth.service';
import { UserRepository } from '../user.repository';

const TEST_EMAIL = 'ada@example.com';

describe('AuthService', () => {
  beforeEach(async () => {
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
    await client.end();
  });

  it('registers a new user and persists the professional profile', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

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

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, TEST_EMAIL))
      .limit(1);

    expect(user).toBeDefined();
    expect(user?.email).toBe(TEST_EMAIL);
    expect(user?.role).toBe('PROFESSIONAL');

    const [profile] = await db
      .select({
        userId: professionalProfiles.userId,
        fullName: professionalProfiles.fullName,
      })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, user!.id))
      .limit(1);

    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(user!.id);
    expect(profile?.fullName).toBe('Ada');
  });

  it('rejects invalid login credentials', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('logs in with valid persisted credentials', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

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
    const repository = new UserRepository();
    const service = new AuthService(repository);

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
    const repository = new UserRepository();
    const service = new AuthService(repository);

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
    const repository = new UserRepository();
    const service = new AuthService(repository);

    await expect(
      service.refresh({
        refreshToken: 'not-a-real-token',
      }),
    ).rejects.toThrow();
  });

  it('rejects a refresh token when the user no longer exists', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    const registered = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });

    await db.delete(users).where(eq(users.email, TEST_EMAIL));

    await expect(
      service.refresh({
        refreshToken: registered.refreshToken,
      }),
    ).rejects.toThrow('Invalid refresh token');
  });

  it.each(['DEACTIVATED', 'SUSPENDED', 'BANNED'] as const)(
    'rejects login for a %s account',
    async (status) => {
      const repository = new UserRepository();
      const service = new AuthService(repository);

      await service.register({
        name: 'Ada',
        email: TEST_EMAIL,
        password: 'supersecret1',
      });

      await db
        .update(users)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(users.email, TEST_EMAIL));

      await expect(
        service.login({
          email: TEST_EMAIL,
          password: 'supersecret1',
        }),
      ).rejects.toThrow('Account is not active');
    },
  );

  it('allows login for an active account', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });

    await db
      .update(users)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(users.email, TEST_EMAIL));

    const result = await service.login({
      email: TEST_EMAIL,
      password: 'supersecret1',
    });

    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('rejects refresh for a non-active account', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    const registered = await service.register({
      name: 'Ada',
      email: TEST_EMAIL,
      password: 'supersecret1',
    });

    await db
      .update(users)
      .set({
        status: 'SUSPENDED',
        updatedAt: new Date(),
      })
      .where(eq(users.email, TEST_EMAIL));

    await expect(
      service.refresh({
        refreshToken: registered.refreshToken,
      }),
    ).rejects.toThrow('Account is not active');
  });
});
