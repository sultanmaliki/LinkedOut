import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyRepository } from '../../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../../professionals/professional-profile.repository';
import { ResponsivenessController } from '../responsiveness.controller';
import { ResponsivenessScoreService } from '../responsiveness-score.service';

describe('ResponsivenessController', () => {
  let controller: ResponsivenessController;

  const scoreService = {
    getProfessionalScore: jest.fn(),
    getCompanyScore: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const companyRepository = {
    isAdmin: jest.fn(),
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
      controllers: [ResponsivenessController],
      providers: [
        { provide: ResponsivenessScoreService, useValue: scoreService },
        { provide: ProfessionalProfileRepository, useValue: profileRepository },
        { provide: CompanyRepository, useValue: companyRepository },
      ],
    }).compile();

    controller = module.get<ResponsivenessController>(ResponsivenessController);
  });

  it("returns the authenticated professional's own score", async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    const score = { totalConsidered: 10, responsiveCount: 9, rate: 0.9 };
    scoreService.getProfessionalScore.mockResolvedValue(score);

    await expect(controller.myResponsiveness(user)).resolves.toEqual(score);
    expect(scoreService.getProfessionalScore).toHaveBeenCalledWith('profile-1');
  });

  it('throws when the user has no professional profile', async () => {
    profileRepository.findByUserId.mockResolvedValue(undefined);

    await expect(controller.myResponsiveness(user)).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('returns a company score for a managing admin', async () => {
    companyRepository.isAdmin.mockResolvedValue(true);
    const score = { totalConsidered: 8, responsiveCount: 6, rate: 0.75 };
    scoreService.getCompanyScore.mockResolvedValue(score);

    await expect(controller.companyResponsiveness('company-1', user)).resolves.toEqual(score);
  });

  it('throws when the user does not manage the company', async () => {
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(controller.companyResponsiveness('company-1', user)).rejects.toThrow(
      new ForbiddenException('You do not manage this company'),
    );
  });
});
