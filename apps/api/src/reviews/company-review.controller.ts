import { Controller, Get, Param } from '@nestjs/common';

import { ReviewService } from './review.service';

@Controller('companies/:companyId/reviews')
export class CompanyReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async listCompanyReviews(@Param('companyId') companyId: string) {
    return this.reviewService.listByCompany(companyId);
  }
}
