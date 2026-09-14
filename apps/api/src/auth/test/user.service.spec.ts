import { NotFoundException } from '@nestjs/common';

import { UserService } from '../user.service';

describe('UserService', () => {
  const repository = {
    findByEmail: jest.fn(),
    updateRole: jest.fn(),
  };

  const service = new UserService(repository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('looks up a user by email, omitting the password hash', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'ada@example.com',
      passwordHash: 'hashed',
      name: 'Ada Lovelace',
      role: 'PROFESSIONAL',
      status: 'ACTIVE',
    });

    await expect(service.lookupByEmail('ada@example.com')).resolves.toEqual({
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      status: 'ACTIVE',
    });

    expect(repository.findByEmail).toHaveBeenCalledWith('ada@example.com');
  });

  it('throws when looking up an email that does not exist', async () => {
    repository.findByEmail.mockResolvedValue(undefined);

    await expect(service.lookupByEmail('missing@example.com')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });

  it('updates a user role', async () => {
    const updated = { id: 'user-1', email: 'ada@example.com', role: 'MODERATOR', status: 'ACTIVE' };
    repository.updateRole.mockResolvedValue(updated);

    await expect(service.updateRole('user-1', 'MODERATOR')).resolves.toEqual(updated);
    expect(repository.updateRole).toHaveBeenCalledWith('user-1', 'MODERATOR');
  });

  it('throws when updating the role of a user that does not exist', async () => {
    repository.updateRole.mockResolvedValue(undefined);

    await expect(service.updateRole('missing-user', 'MODERATOR')).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });
});
