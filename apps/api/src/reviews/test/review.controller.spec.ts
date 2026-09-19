import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../auth/guards/auth.guard';
import { ReviewController } from '../review.controller';
import { ReviewService } from '../review.service';

describe('ReviewController', () => {
  let controller: ReviewController;

  const reviewService = {
    createReview: jest.fn(),
    getReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
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
      controllers: [ReviewController],
      providers: [{ provide: ReviewService, useValue: reviewService }],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('creates a review for the authenticated user', async () => {
    const dto = {
      companyId: 'company-1',
      employmentHistoryId: 'history-1',
      title: 'Great place to work',
      review: 'A'.repeat(30),
      ratings: [{ category: 'CULTURE' as const, score: 5 }],
    };
    const created = { id: 'review-1', ...dto };
    reviewService.createReview.mockResolvedValue(created);

    await expect(controller.createReview(user, dto)).resolves.toEqual(created);
    expect(reviewService.createReview).toHaveBeenCalledWith('user-1', dto);
  });

  it('gets a review by id', async () => {
    const review = { id: 'review-1' };
    reviewService.getReview.mockResolvedValue(review);

    await expect(controller.getReview('review-1')).resolves.toEqual(review);
    expect(reviewService.getReview).toHaveBeenCalledWith('review-1');
  });

  it('updates a review for the authenticated user', async () => {
    const dto = { title: 'Updated title' };
    const updated = { id: 'review-1', ...dto };
    reviewService.updateReview.mockResolvedValue(updated);

    await expect(controller.updateReview('review-1', user, dto)).resolves.toEqual(updated);
    expect(reviewService.updateReview).toHaveBeenCalledWith('review-1', 'user-1', dto);
  });

  it('deletes a review for the authenticated user', async () => {
    reviewService.deleteReview.mockResolvedValue(undefined);

    await controller.deleteReview('review-1', user);

    expect(reviewService.deleteReview).toHaveBeenCalledWith('review-1', 'user-1');
  });
});
