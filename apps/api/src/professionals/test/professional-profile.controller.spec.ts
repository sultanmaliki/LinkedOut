import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../auth/guards/auth.guard';
import { UpdateProfessionalProfileDto } from '../dto/update-professional-profile.dto';
import { EmploymentExpectationService } from '../employment-expectation/employment-expectation.service';
import { PortfolioLinkService } from '../portfolio-links/portfolio-link.service';
import { ProfessionalProfileController } from '../professional-profile.controller';
import { ProfessionalProfileService } from '../professional-profile.service';
import { SkillService } from '../skills/skill.service';

describe('ProfessionalProfileController', () => {
  let controller: ProfessionalProfileController;

  const profileService = {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    getProfile: jest.fn(),
    searchProfiles: jest.fn(),
  };

  const skillService = {
    listForProfileId: jest.fn(),
  };

  const portfolioLinkService = {
    listForProfileId: jest.fn(),
  };

  const employmentExpectationService = {
    getForProfileId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalProfileController],
      providers: [
        {
          provide: ProfessionalProfileService,
          useValue: profileService,
        },
        {
          provide: SkillService,
          useValue: skillService,
        },
        {
          provide: PortfolioLinkService,
          useValue: portfolioLinkService,
        },
        {
          provide: EmploymentExpectationService,
          useValue: employmentExpectationService,
        },
      ],
    }).compile();

    controller = module.get<ProfessionalProfileController>(ProfessionalProfileController);
  });

  it('gets the authenticated professional profile', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };

    const profile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
    };

    profileService.getMyProfile.mockResolvedValue(profile);

    await expect(controller.getMyProfile(user)).resolves.toEqual(profile);

    expect(profileService.getMyProfile).toHaveBeenCalledWith('user-1');
  });

  it('updates the authenticated professional profile', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };

    const dto: UpdateProfessionalProfileDto = {
      headline: 'Senior Software Engineer',
      bio: 'Builds reliable systems.',
      currentLocation: 'London',
    };

    const profile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
      headline: 'Senior Software Engineer',
      bio: 'Builds reliable systems.',
      profilePhotoUrl: null,
      bannerPhotoUrl: null,
      currentLocation: 'London',
      personalWebsite: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    profileService.updateMyProfile.mockResolvedValue(profile);

    await expect(controller.updateMyProfile(user, dto)).resolves.toEqual(profile);

    expect(profileService.updateMyProfile).toHaveBeenCalledWith('user-1', dto);
  });

  it('passes only the authenticated user id to the update service', async () => {
    const user: AuthenticatedUser = {
      id: 'user-42',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
      emailVerified: true,
    };

    const dto: UpdateProfessionalProfileDto = {
      fullName: 'Ada Byron Lovelace',
    };

    profileService.updateMyProfile.mockResolvedValue({
      id: 'profile-42',
      userId: 'user-42',
      fullName: 'Ada Byron Lovelace',
    });

    await controller.updateMyProfile(user, dto);

    expect(profileService.updateMyProfile).toHaveBeenCalledTimes(1);
    expect(profileService.updateMyProfile).toHaveBeenCalledWith('user-42', dto);
  });

  it('gets a professional profile by id', async () => {
    const profile = { id: 'profile-1', fullName: 'Ada Lovelace' };
    profileService.getProfile.mockResolvedValue(profile);

    await expect(controller.getProfile('profile-1')).resolves.toEqual(profile);
    expect(profileService.getProfile).toHaveBeenCalledWith('profile-1');
  });

  it('searches professional profiles', async () => {
    const query = { headline: 'Engineer', location: 'London', skill: 'Rust' };
    const results = [{ id: 'profile-1', fullName: 'Ada Lovelace' }];
    profileService.searchProfiles.mockResolvedValue(results);

    await expect(controller.searchProfiles(query)).resolves.toEqual(results);
    expect(profileService.searchProfiles).toHaveBeenCalledWith(query);
  });

  it('gets skills for a profile by id', async () => {
    const skills = [{ skillId: 'skill-1', name: 'TypeScript' }];
    skillService.listForProfileId.mockResolvedValue(skills);

    await expect(controller.getProfileSkills('profile-1')).resolves.toEqual(skills);
    expect(skillService.listForProfileId).toHaveBeenCalledWith('profile-1');
  });

  it('gets portfolio links for a profile by id', async () => {
    const links = [{ id: 'link-1', title: 'GitHub', url: 'https://github.com/ada' }];
    portfolioLinkService.listForProfileId.mockResolvedValue(links);

    await expect(controller.getProfilePortfolioLinks('profile-1')).resolves.toEqual(links);
    expect(portfolioLinkService.listForProfileId).toHaveBeenCalledWith('profile-1');
  });

  it('gets employment expectation for a profile by id', async () => {
    const expectation = { desiredJobTitle: 'Senior Engineer' };
    employmentExpectationService.getForProfileId.mockResolvedValue(expectation);

    await expect(controller.getProfileEmploymentExpectation('profile-1')).resolves.toEqual(
      expectation,
    );
    expect(employmentExpectationService.getForProfileId).toHaveBeenCalledWith('profile-1');
  });
});
