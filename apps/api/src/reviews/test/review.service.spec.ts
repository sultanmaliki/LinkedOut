import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { ReviewService } from '../review.service';

describe('ReviewService', () => {
  const reviewRepository = {
    existsForEmploymentHistory: jest.fn(),
    findOwnerProfileId: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    listByCompany: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const historyRepository = {
    findById: jest.fn(),
  };

  const verificationRepository = {
    findByHistoryId: jest.fn(),
  };

  const service = new ReviewService(
    reviewRepository as never,
    companyRepository as never,
    profileRepository as never,
    historyRepository as never,
    verificationRepository as never,
  );

  const dto = {
    companyId: 'company-1',
    employmentHistoryId: 'history-1',
    title: 'Great place to work',
    review: 'A'.repeat(30),
    ratings: [{ category: 'CULTURE' as const, score: 5 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a review when employment is verified', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1', fullName: 'Ada' });
    historyRepository.findById.mockResolvedValue({
      id: 'history-1',
      jobTitle: 'Engineer',
      companyName: 'Acme',
    });
    verificationRepository.findByHistoryId.mockResolvedValue({ verificationStatus: 'VERIFIED' });
    companyRepository.findById.mockResolvedValue({
      id: 'company-1',
      legalName: 'Acme Inc',
      displayName: 'Acme',
    });
    reviewRepository.existsForEmploymentHistory.mockResolvedValue(false);

    const created = { id: 'review-1', ...dto };
    reviewRepository.create.mockResolvedValue(created);

    await expect(service.createReview('user-1', dto)).resolves.toEqual(created);
    expect(reviewRepository.create).toHaveBeenCalled();
  });

  it('throws when the employment history is not verified', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });
    verificationRepository.findByHistoryId.mockResolvedValue({ verificationStatus: 'PENDING' });

    await expect(service.createReview('user-1', dto)).rejects.toThrow(
      new ForbiddenException('Employment must be verified before submitting a review'),
    );

    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it('throws when no verification has been submitted at all', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });
    verificationRepository.findByHistoryId.mockResolvedValue(undefined);

    await expect(service.createReview('user-1', dto)).rejects.toThrow(
      new ForbiddenException('Employment must be verified before submitting a review'),
    );
  });

  it('throws when the employment history does not belong to the user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue(undefined);

    await expect(service.createReview('user-1', dto)).rejects.toThrow(
      new NotFoundException('Employment history not found'),
    );
  });

  it('throws when a review already exists for the employment history', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1', companyName: 'Acme' });
    verificationRepository.findByHistoryId.mockResolvedValue({ verificationStatus: 'VERIFIED' });
    companyRepository.findById.mockResolvedValue({
      id: 'company-1',
      legalName: 'Acme Inc',
      displayName: 'Acme',
    });
    reviewRepository.existsForEmploymentHistory.mockResolvedValue(true);

    await expect(service.createReview('user-1', dto)).rejects.toThrow(
      new ConflictException('A review already exists for this employment history'),
    );
  });

  it('throws when the verified employment history is at a different company than the one being reviewed', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1', fullName: 'Ada' });
    historyRepository.findById.mockResolvedValue({
      id: 'history-1',
      jobTitle: 'Engineer',
      companyName: 'SomeOtherCompany',
    });
    verificationRepository.findByHistoryId.mockResolvedValue({ verificationStatus: 'VERIFIED' });
    companyRepository.findById.mockResolvedValue({
      id: 'company-1',
      legalName: 'Acme Inc',
      displayName: 'Acme',
    });

    await expect(service.createReview('user-1', dto)).rejects.toThrow(
      new ForbiddenException(
        'This employment history is not associated with the company being reviewed',
      ),
    );

    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it('returns a review by id', async () => {
    const review = { id: 'review-1', title: 'Great place to work' };
    reviewRepository.findById.mockResolvedValue(review);

    await expect(service.getReview('review-1')).resolves.toEqual(review);
  });

  it('throws when the review does not exist', async () => {
    reviewRepository.findById.mockResolvedValue(undefined);

    await expect(service.getReview('missing')).rejects.toThrow(
      new NotFoundException('Review not found'),
    );
  });

  it('lists reviews for an existing company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    const reviewList = [{ id: 'review-1' }];
    reviewRepository.listByCompany.mockResolvedValue(reviewList);

    await expect(service.listByCompany('company-1')).resolves.toEqual(reviewList);
  });

  it('updates a review owned by the authenticated user', async () => {
    reviewRepository.findOwnerProfileId.mockResolvedValue('profile-1');
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const updated = { id: 'review-1', title: 'Updated title' };
    reviewRepository.updateById.mockResolvedValue(updated);

    await expect(
      service.updateReview('review-1', 'user-1', { title: 'Updated title' }),
    ).resolves.toEqual(updated);
  });

  it('throws when updating a review owned by someone else', async () => {
    reviewRepository.findOwnerProfileId.mockResolvedValue('profile-1');
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });

    await expect(
      service.updateReview('review-1', 'user-2', { title: 'Updated title' }),
    ).rejects.toThrow(new ForbiddenException('You do not own this review'));

    expect(reviewRepository.updateById).not.toHaveBeenCalled();
  });

  it('deletes a review owned by the authenticated user', async () => {
    reviewRepository.findOwnerProfileId.mockResolvedValue('profile-1');
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    reviewRepository.deleteById.mockResolvedValue(true);

    await expect(service.deleteReview('review-1', 'user-1')).resolves.toBeUndefined();
  });
});
