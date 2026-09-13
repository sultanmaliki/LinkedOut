import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { SkillController } from '../skill.controller';
import { SkillService } from '../skill.service';

describe('SkillController', () => {
  let controller: SkillController;

  const skillService = {
    listMySkills: jest.fn(),
    setMySkills: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillController],
      providers: [{ provide: SkillService, useValue: skillService }],
    }).compile();

    controller = module.get<SkillController>(SkillController);
  });

  it('lists skills for the authenticated user', async () => {
    const skillList = [{ skillId: 'skill-1', name: 'TypeScript' }];
    skillService.listMySkills.mockResolvedValue(skillList);

    await expect(controller.listMySkills(user)).resolves.toEqual(skillList);
    expect(skillService.listMySkills).toHaveBeenCalledWith('user-1');
  });

  it('sets skills for the authenticated user', async () => {
    const dto = { skills: [{ name: 'TypeScript' }] };
    const result = [{ skillId: 'skill-1', name: 'TypeScript' }];
    skillService.setMySkills.mockResolvedValue(result);

    await expect(controller.setMySkills(user, dto)).resolves.toEqual(result);
    expect(skillService.setMySkills).toHaveBeenCalledWith('user-1', dto);
  });
});
