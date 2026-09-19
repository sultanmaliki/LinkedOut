import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { EmploymentHistoryController } from '../employment-history.controller';
import { EmploymentHistoryService } from '../employment-history.service';

describe('EmploymentHistoryController', () => {
  let controller: EmploymentHistoryController;

  const historyService = {
    listMyHistory: jest.fn(),
    createHistory: jest.fn(),
    updateHistory: jest.fn(),
    deleteHistory: jest.fn(),
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
      controllers: [EmploymentHistoryController],
      providers: [{ provide: EmploymentHistoryService, useValue: historyService }],
    }).compile();

    controller = module.get<EmploymentHistoryController>(EmploymentHistoryController);
  });

  it('lists history for the authenticated user', async () => {
    const history = [{ id: 'history-1' }];
    historyService.listMyHistory.mockResolvedValue(history);

    await expect(controller.listMyHistory(user)).resolves.toEqual(history);
    expect(historyService.listMyHistory).toHaveBeenCalledWith('user-1');
  });

  it('creates history for the authenticated user', async () => {
    const dto = {
      companyName: 'Acme Corp',
      jobTitle: 'Software Engineer',
      employmentType: 'FULL_TIME' as const,
      workMode: 'REMOTE' as const,
      startDate: '2022-01-01',
    };
    const created = { id: 'history-1', ...dto };
    historyService.createHistory.mockResolvedValue(created);

    await expect(controller.createHistory(user, dto)).resolves.toEqual(created);
    expect(historyService.createHistory).toHaveBeenCalledWith('user-1', dto);
  });

  it('updates history for the authenticated user', async () => {
    const dto = { jobTitle: 'Staff Engineer' };
    const updated = { id: 'history-1', ...dto };
    historyService.updateHistory.mockResolvedValue(updated);

    await expect(controller.updateHistory('history-1', user, dto)).resolves.toEqual(updated);
    expect(historyService.updateHistory).toHaveBeenCalledWith('user-1', 'history-1', dto);
  });

  it('deletes history for the authenticated user', async () => {
    historyService.deleteHistory.mockResolvedValue(undefined);

    await controller.deleteHistory('history-1', user);

    expect(historyService.deleteHistory).toHaveBeenCalledWith('user-1', 'history-1');
  });
});
