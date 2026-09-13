import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ReviewRepository } from '../review.repository';
import { SubmitCompanyReplyDto } from './dto/submit-company-reply.dto';
import { CompanyReplyRecord, CompanyReplyRepository } from './company-reply.repository';

@Injectable()
export class CompanyReplyService {
  constructor(
    private readonly replyRepository: CompanyReplyRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async createReply(
    reviewId: string,
    userId: string,
    dto: SubmitCompanyReplyDto,
  ): Promise<CompanyReplyRecord> {
    const review = await this.requireReviewAndAdmin(reviewId, userId);

    const existing = await this.replyRepository.findByReviewId(review.id);

    if (existing) {
      throw new ConflictException('This review already has a reply');
    }

    return this.replyRepository.create(reviewId, dto.reply);
  }

  async updateReply(
    reviewId: string,
    userId: string,
    dto: SubmitCompanyReplyDto,
  ): Promise<CompanyReplyRecord> {
    await this.requireReviewAndAdmin(reviewId, userId);

    const updated = await this.replyRepository.updateByReviewId(reviewId, dto.reply);

    if (!updated) {
      throw new NotFoundException('Company reply not found');
    }

    return updated;
  }

  private async requireReviewAndAdmin(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(review.companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    return review;
  }
}
