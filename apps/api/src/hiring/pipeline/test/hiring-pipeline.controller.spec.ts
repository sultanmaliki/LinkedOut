import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { HiringPipelineController } from '../hiring-pipeline.controller';
import { HiringPipelineService } from '../hiring-pipeline.service';

describe('HiringPipelineController', () => {
  let controller: HiringPipelineController;

  const pipelineService = {
    listStages: jest.fn(),
    appendStage: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HiringPipelineController],
      providers: [{ provide: HiringPipelineService, useValue: pipelineService }],
    }).compile();

    controller = module.get<HiringPipelineController>(HiringPipelineController);
  });

  it('lists stages for an opportunity', async () => {
    const stages = [{ id: 'stage-1', stage: 'SENT' }];
    pipelineService.listStages.mockResolvedValue(stages);

    await expect(controller.listStages('opportunity-1', user)).resolves.toEqual(stages);
    expect(pipelineService.listStages).toHaveBeenCalledWith('opportunity-1', 'user-1');
  });

  it('appends a stage for the authenticated user', async () => {
    const dto = { stage: 'INTERVIEW_SCHEDULED' as const };
    const stage = { id: 'stage-1', ...dto };
    pipelineService.appendStage.mockResolvedValue(stage);

    await expect(controller.appendStage('opportunity-1', user, dto)).resolves.toEqual(stage);
    expect(pipelineService.appendStage).toHaveBeenCalledWith('opportunity-1', 'user-1', dto);
  });
});
