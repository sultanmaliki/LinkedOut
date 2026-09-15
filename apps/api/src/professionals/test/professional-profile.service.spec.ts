import { NotFoundException } from '@nestjs/common';

import { ProfessionalProfileService } from '../professional-profile.service';

describe('ProfessionalProfileService', () => {
  const repository = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    updateByUserId: jest.fn(),
    search: jest.fn(),
  };

  const service = new ProfessionalProfileService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the current professional profile', async () => {
    const profile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
      headline: 'Software Engineer',
      bio: 'Builds things.',
      profilePhotoUrl: null,
      bannerPhotoUrl: null,
      currentLocation: 'London',
      personalWebsite: 'https://ada.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.findByUserId.mockResolvedValue(profile);

    await expect(service.getMyProfile('user-1')).resolves.toEqual(profile);

    expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('throws when the profile does not exist', async () => {
    repository.findByUserId.mockResolvedValue(undefined);

    await expect(service.getMyProfile('missing-user')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('returns a profile by id for public lookup', async () => {
    const profile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
    };

    repository.findById.mockResolvedValue(profile);

    await expect(service.getProfile('profile-1')).resolves.toEqual(profile);
    expect(repository.findById).toHaveBeenCalledWith('profile-1');
  });

  it('throws when looking up a profile id that does not exist', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.getProfile('missing')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('searches profiles with default pagination when no query is given', async () => {
    repository.search.mockResolvedValue([]);

    await expect(service.searchProfiles({})).resolves.toEqual([]);

    expect(repository.search).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      q: undefined,
      headline: undefined,
      location: undefined,
      skill: undefined,
      activelyLooking: undefined,
    });
  });

  it('searches profiles with the supplied filters and pagination', async () => {
    const results = [{ id: 'profile-1', fullName: 'Ada Lovelace' }];
    repository.search.mockResolvedValue(results);

    await expect(
      service.searchProfiles({
        limit: 5,
        offset: 10,
        headline: 'Engineer',
        location: 'London',
        skill: 'Rust',
        activelyLooking: true,
      }),
    ).resolves.toEqual(results);

    expect(repository.search).toHaveBeenCalledWith({
      limit: 5,
      offset: 10,
      q: undefined,
      headline: 'Engineer',
      location: 'London',
      skill: 'Rust',
      activelyLooking: true,
    });
  });

  it('searches profiles by a general query term', async () => {
    const results = [{ id: 'profile-1', fullName: 'Ada Lovelace' }];
    repository.search.mockResolvedValue(results);

    await expect(service.searchProfiles({ q: 'Ada' })).resolves.toEqual(results);

    expect(repository.search).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      q: 'Ada',
      headline: undefined,
      location: undefined,
      skill: undefined,
      activelyLooking: undefined,
    });
  });

  it('updates the current professional profile', async () => {
    const existingProfile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
      headline: 'Software Engineer',
      bio: null,
      profilePhotoUrl: null,
      bannerPhotoUrl: null,
      currentLocation: 'London',
      personalWebsite: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedProfile = {
      ...existingProfile,
      headline: 'Senior Software Engineer',
      bio: 'Builds things.',
    };

    repository.findByUserId.mockResolvedValue(existingProfile);
    repository.updateByUserId.mockResolvedValue(updatedProfile);

    await expect(
      service.updateMyProfile('user-1', {
        headline: 'Senior Software Engineer',
        bio: 'Builds things.',
      }),
    ).resolves.toEqual(updatedProfile);

    expect(repository.findByUserId).toHaveBeenCalledWith('user-1');

    expect(repository.updateByUserId).toHaveBeenCalledWith('user-1', {
      headline: 'Senior Software Engineer',
      bio: 'Builds things.',
    });
  });

  it('throws when updating a profile that does not exist', async () => {
    repository.findByUserId.mockResolvedValue(undefined);

    await expect(
      service.updateMyProfile('missing-user', {
        headline: 'Software Engineer',
      }),
    ).rejects.toThrow(new NotFoundException('Professional profile not found'));

    expect(repository.updateByUserId).not.toHaveBeenCalled();
  });

  it('throws when the update affects no profile', async () => {
    const existingProfile = {
      id: 'profile-1',
      userId: 'user-1',
      fullName: 'Ada Lovelace',
      headline: null,
      bio: null,
      profilePhotoUrl: null,
      bannerPhotoUrl: null,
      currentLocation: null,
      personalWebsite: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.findByUserId.mockResolvedValue(existingProfile);
    repository.updateByUserId.mockResolvedValue(undefined);

    await expect(
      service.updateMyProfile('user-1', {
        headline: 'Software Engineer',
      }),
    ).rejects.toThrow(new NotFoundException('Professional profile not found'));
  });
});
