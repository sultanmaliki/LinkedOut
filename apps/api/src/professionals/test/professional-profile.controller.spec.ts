import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../auth/guards/auth.guard';
import { UpdateProfessionalProfileDto } from '../dto/update-professional-profile.dto';
import { ProfessionalProfileController } from '../professional-profile.controller';
import { ProfessionalProfileService } from '../professional-profile.service';

describe('ProfessionalProfileController', () => {
  let controller: ProfessionalProfileController;

  const profileService = {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<ProfessionalProfileController>(ProfessionalProfileController);
  });

  it('gets the authenticated professional profile', async () => {
    const user: AuthenticatedUser = {
      id: 'user-1',
      email: 'ada@example.com',
      role: 'PROFESSIONAL',
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
});
