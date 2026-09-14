import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;

  const userService = {
    lookupByEmail: jest.fn(),
    updateRole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('looks up a user by email', async () => {
    const user = { id: 'user-1', email: 'ada@example.com', role: 'PROFESSIONAL', status: 'ACTIVE' };
    userService.lookupByEmail.mockResolvedValue(user);

    await expect(controller.lookupByEmail('ada@example.com')).resolves.toEqual(user);
    expect(userService.lookupByEmail).toHaveBeenCalledWith('ada@example.com');
  });

  it('updates a user role', async () => {
    const updated = { id: 'user-1', email: 'ada@example.com', role: 'MODERATOR', status: 'ACTIVE' };
    userService.updateRole.mockResolvedValue(updated);

    await expect(controller.updateRole('user-1', { role: 'MODERATOR' })).resolves.toEqual(updated);
    expect(userService.updateRole).toHaveBeenCalledWith('user-1', 'MODERATOR');
  });
});
