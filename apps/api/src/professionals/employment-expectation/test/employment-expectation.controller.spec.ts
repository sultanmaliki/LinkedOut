import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { EmploymentExpectationController } from '../employment-expectation.controller';
import { EmploymentExpectationService } from '../employment-expectation.service';

describe('EmploymentExpectationController', () => {
  let controller: EmploymentExpectationController;

  const expectationService = {
    getMyExpectation: jest.fn(),
    setMyExpectation: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
    emailVerified: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploymentExpectationController],
      providers: [{ provide: EmploymentExpectationService, useValue: expectationService }],
    }).compile();

    controller = module.get<EmploymentExpectationController>(EmploymentExpectationController);
  });

  it('gets the expectation for the authenticated user', async () => {
    const expectation = { desiredJobTitle: 'Senior Engineer' };
    expectationService.getMyExpectation.mockResolvedValue(expectation);

    await expect(controller.getMyExpectation(user)).resolves.toEqual(expectation);
    expect(expectationService.getMyExpectation).toHaveBeenCalledWith('user-1');
  });

  it('sets the expectation for the authenticated user', async () => {
    const dto = {
      desiredJobTitle: 'Senior Engineer',
      employmentType: 'FULL_TIME' as const,
      workMode: 'REMOTE' as const,
    };
    const result = { ...dto };
    expectationService.setMyExpectation.mockResolvedValue(result);

    await expect(controller.setMyExpectation(user, dto)).resolves.toEqual(result);
    expect(expectationService.setMyExpectation).toHaveBeenCalledWith('user-1', dto);
  });
});
