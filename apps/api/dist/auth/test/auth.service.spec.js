'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const auth_service_1 = require('../auth.service');
const user_repository_1 = require('../user.repository');
describe('AuthService', () => {
  it('registers a new user and returns tokens', async () => {
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
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
    const repository = new user_repository_1.UserRepository();
    const service = new auth_service_1.AuthService(repository);
    await expect(
      service.login({ email: 'missing@example.com', password: 'wrongpass' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
