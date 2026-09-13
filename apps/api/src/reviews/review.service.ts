import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRepository } from '../companies/company.repository';
import { EmploymentHistoryRepository } from '../professionals/employment-history/employment-history.repository';
import { EmploymentVerificationRepository } from '../professionals/employment-verification/employment-verification.repository';
import { ProfessionalProfileRepository } from '../professionals/professional-profile.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepository, ReviewWithRatings } from './review.repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
    private readonly historyRepository: EmploymentHistoryRepository,
    private readonly verificationRepository: EmploymentVerificationRepository,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewWithRatings> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const history = await this.historyRepository.findById(profile.id, dto.employmentHistoryId);

    if (!history) {
      throw new NotFoundException('Employment history not found');
    }

    const verification = await this.verificationRepository.findByHistoryId(dto.employmentHistoryId);

    if (!verification || verification.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenException('Employment must be verified before submitting a review');
    }

    const company = await this.companyRepository.findById(dto.companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const alreadyReviewed = await this.reviewRepository.existsForEmploymentHistory(
      dto.employmentHistoryId,
    );

    if (alreadyReviewed) {
      throw new ConflictException('A review already exists for this employment history');
    }

    return this.reviewRepository.create(
      {
        companyId: dto.companyId,
        employmentHistoryId: dto.employmentHistoryId,
        title: dto.title,
        review: dto.review,
        anonymous: dto.anonymous,
        recommended: dto.recommended,
        ratings: dto.ratings,
      },
      {
        company: {
          id: company.id,
          displayName: company.displayName,
          companyType: company.companyType,
          industry: company.industry,
        },
        professional: {
          id: profile.id,
          fullName: profile.fullName,
          jobTitle: history.jobTitle,
          companyName: history.companyName,
          employmentType: history.employmentType,
          workMode: history.workMode,
          startDate: history.startDate,
          endDate: history.endDate,
          currentlyWorking: history.currentlyWorking,
        },
      },
    );
  }

  async getReview(reviewId: string): Promise<ReviewWithRatings> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async listByCompany(companyId: string): Promise<ReviewWithRatings[]> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.reviewRepository.listByCompany(companyId);
  }

  async updateReview(
    reviewId: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewWithRatings> {
    await this.requireOwnership(reviewId, userId);

    const updated = await this.reviewRepository.updateById(
      reviewId,
      {
        title: dto.title,
        review: dto.review,
        recommended: dto.recommended,
        anonymous: dto.anonymous,
      },
      dto.ratings,
    );

    if (!updated) {
      throw new NotFoundException('Review not found');
    }

    return updated;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    await this.requireOwnership(reviewId, userId);

    const deleted = await this.reviewRepository.deleteById(reviewId);

    if (!deleted) {
      throw new NotFoundException('Review not found');
    }
  }

  private async requireOwnership(reviewId: string, userId: string): Promise<void> {
    const ownerProfileId = await this.reviewRepository.findOwnerProfileId(reviewId);

    if (!ownerProfileId) {
      throw new NotFoundException('Review not found');
    }

    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile || profile.id !== ownerProfileId) {
      throw new ForbiddenException('You do not own this review');
    }
  }
}
