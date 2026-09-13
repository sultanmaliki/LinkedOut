import { Test, TestingModule } from '@nestjs/testing';

import { CompanyReviewController } from '../company-review.controller';
import { ReviewService } from '../review.service';

describe('CompanyReviewController', () => {
  let controller: CompanyReviewController;

  const reviewService = {
    listByCompany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyReviewController],
      providers: [{ provide: ReviewService, useValue: reviewService }],
    }).compile();

    controller = module.get<CompanyReviewController>(CompanyReviewController);
  });

  it('lists reviews for a company', async () => {
    const reviews = [{ id: 'review-1' }];
    reviewService.listByCompany.mockResolvedValue(reviews);

    await expect(controller.listCompanyReviews('company-1')).resolves.toEqual(reviews);
    expect(reviewService.listByCompany).toHaveBeenCalledWith('company-1');
  });
});
