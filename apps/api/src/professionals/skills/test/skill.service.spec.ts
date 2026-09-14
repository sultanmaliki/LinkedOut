import { NotFoundException } from '@nestjs/common';

import { SkillService } from '../skill.service';

describe('SkillService', () => {
  const skillRepository = {
    listForProfile: jest.fn(),
    replaceForProfile: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new SkillService(skillRepository as never, profileRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists skills for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const skillList = [{ skillId: 'skill-1', name: 'TypeScript', proficiency: 4 }];
    skillRepository.listForProfile.mockResolvedValue(skillList);

    await expect(service.listMySkills('user-1')).resolves.toEqual(skillList);
    expect(skillRepository.listForProfile).toHaveBeenCalledWith('profile-1');
  });

  it('throws when the professional profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(undefined);

    await expect(service.listMySkills('missing')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('lists skills by profile id without resolving through a user', async () => {
    const skillList = [{ skillId: 'skill-1', name: 'TypeScript', proficiency: 4 }];
    skillRepository.listForProfile.mockResolvedValue(skillList);

    await expect(service.listForProfileId('profile-1')).resolves.toEqual(skillList);
    expect(skillRepository.listForProfile).toHaveBeenCalledWith('profile-1');
    expect(profileRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('replaces skills for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const dto = { skills: [{ name: 'TypeScript', proficiency: 4 }] };
    const result = [{ skillId: 'skill-1', name: 'TypeScript', proficiency: 4 }];
    skillRepository.replaceForProfile.mockResolvedValue(result);

    await expect(service.setMySkills('user-1', dto)).resolves.toEqual(result);
    expect(skillRepository.replaceForProfile).toHaveBeenCalledWith('profile-1', dto.skills);
  });
});
