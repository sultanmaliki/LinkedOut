import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { VerificationReviewController } from '../verification-review.controller';
import { VerificationReviewService } from '../verification-review.service';

describe('VerificationReviewController', () => {
  let controller: VerificationReviewController;

  const reviewService = {
    listPendingCompanies: jest.fn(),
    reviewCompany: jest.fn(),
    listPendingProfessionals: jest.fn(),
    reviewProfessional: jest.fn(),
  };

  const moderator: AuthenticatedUser = {
    id: 'moderator-1',
    email: 'mod@example.com',
    role: 'MODERATOR',
    emailVerified: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationReviewController],
      providers: [{ provide: VerificationReviewService, useValue: reviewService }],
    }).compile();

    controller = module.get(VerificationReviewController);
  });

  it('lists pending company verifications', async () => {
    const results = [{ id: 'ver-1' }];
    reviewService.listPendingCompanies.mockResolvedValue(results);

    await expect(controller.listPendingCompanies()).resolves.toEqual(results);
  });

  it('reviews a company verification', async () => {
    const dto = { status: 'VERIFIED' as const };
    const updated = { id: 'ver-1', verificationStatus: 'VERIFIED' };
    reviewService.reviewCompany.mockResolvedValue(updated);

    await expect(controller.reviewCompany('ver-1', moderator, dto)).resolves.toEqual(updated);
    expect(reviewService.reviewCompany).toHaveBeenCalledWith('ver-1', 'moderator-1', dto);
  });

  it('lists pending employment verifications', async () => {
    const results = [{ id: 'ever-1' }];
    reviewService.listPendingProfessionals.mockResolvedValue(results);

    await expect(controller.listPendingProfessionals()).resolves.toEqual(results);
  });

  it('reviews an employment verification', async () => {
    const dto = { status: 'REJECTED' as const, rejectionReason: 'Document is illegible' };
    const updated = { id: 'ever-1', verificationStatus: 'REJECTED' };
    reviewService.reviewProfessional.mockResolvedValue(updated);

    await expect(controller.reviewProfessional('ever-1', moderator, dto)).resolves.toEqual(updated);
    expect(reviewService.reviewProfessional).toHaveBeenCalledWith('ever-1', 'moderator-1', dto);
  });
});
