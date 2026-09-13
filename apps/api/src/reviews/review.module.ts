import { Module } from '@nestjs/common';

import { CompanyModule } from '../companies/company.module';
import { ProfessionalProfileModule } from '../professionals/professional-profile.module';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';
import { CompanyReviewController } from './company-review.controller';
import { CompanyReplyController } from './replies/company-reply.controller';
import { CompanyReplyRepository } from './replies/company-reply.repository';
import { CompanyReplyService } from './replies/company-reply.service';

@Module({
  imports: [CompanyModule, ProfessionalProfileModule],
  controllers: [ReviewController, CompanyReviewController, CompanyReplyController],
  providers: [ReviewRepository, ReviewService, CompanyReplyRepository, CompanyReplyService],
})
export class ReviewModule {}
