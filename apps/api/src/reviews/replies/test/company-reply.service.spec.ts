import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { CompanyReplyService } from '../company-reply.service';

describe('CompanyReplyService', () => {
  const replyRepository = {
    findByReviewId: jest.fn(),
    create: jest.fn(),
    updateByReviewId: jest.fn(),
  };

  const reviewRepository = {
    findById: jest.fn(),
  };

  const companyRepository = {
    isAdmin: jest.fn(),
  };

  const service = new CompanyReplyService(
    replyRepository as never,
    reviewRepository as never,
    companyRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the reply for a review that has one', async () => {
    const reply = { id: 'reply-1', reviewId: 'review-1', reply: 'Thanks!' };
    replyRepository.findByReviewId.mockResolvedValue(reply);

    await expect(service.getReply('review-1')).resolves.toEqual(reply);
  });

  it('returns null for a review with no reply', async () => {
    replyRepository.findByReviewId.mockResolvedValue(undefined);

    await expect(service.getReply('review-1')).resolves.toBeNull();
  });

  it('creates a reply when the user manages the reviewed company', async () => {
    reviewRepository.findById.mockResolvedValue({ id: 'review-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    replyRepository.findByReviewId.mockResolvedValue(undefined);

    const created = { id: 'reply-1', reviewId: 'review-1', reply: 'Thanks!' };
    replyRepository.create.mockResolvedValue(created);

    await expect(service.createReply('review-1', 'user-1', { reply: 'Thanks!' })).resolves.toEqual(
      created,
    );
  });

  it('throws when the review does not exist', async () => {
    reviewRepository.findById.mockResolvedValue(undefined);

    await expect(service.createReply('missing', 'user-1', { reply: 'Thanks!' })).rejects.toThrow(
      new NotFoundException('Review not found'),
    );
  });

  it('throws when the user does not manage the reviewed company', async () => {
    reviewRepository.findById.mockResolvedValue({ id: 'review-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(service.createReply('review-1', 'user-2', { reply: 'Thanks!' })).rejects.toThrow(
      new ForbiddenException('You do not manage this company'),
    );
  });

  it('throws when a reply already exists', async () => {
    reviewRepository.findById.mockResolvedValue({ id: 'review-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    replyRepository.findByReviewId.mockResolvedValue({ id: 'reply-1' });

    await expect(service.createReply('review-1', 'user-1', { reply: 'Thanks!' })).rejects.toThrow(
      new ConflictException('This review already has a reply'),
    );

    expect(replyRepository.create).not.toHaveBeenCalled();
  });

  it('updates an existing reply', async () => {
    reviewRepository.findById.mockResolvedValue({ id: 'review-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const updated = { id: 'reply-1', reply: 'Thanks again!' };
    replyRepository.updateByReviewId.mockResolvedValue(updated);

    await expect(
      service.updateReply('review-1', 'user-1', { reply: 'Thanks again!' }),
    ).resolves.toEqual(updated);
  });
});
