import { AuthService } from '../auth.service';
import { UserRepository } from '../user.repository';

describe('AuthService', () => {
  it('registers a new user and returns tokens', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    const result = await service.register({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'supersecret1',
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe('ada@example.com');
  });

  it('rejects invalid login credentials', async () => {
    const repository = new UserRepository();
    const service = new AuthService(repository);

    await expect(
      service.login({ email: 'missing@example.com', password: 'wrongpass' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
