import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { VerificationReviewService } from './verification-review.service';

@Controller('moderation/verifications')
@UseGuards(AuthGuard, ModeratorGuard)
export class VerificationReviewController {
  constructor(private readonly reviewService: VerificationReviewService) {}

  @Get('companies')
  async listPendingCompanies() {
    return this.reviewService.listPendingCompanies();
  }

  @Patch('companies/:id')
  async reviewCompany(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.reviewService.reviewCompany(id, user.id, dto);
  }

  @Get('professionals')
  async listPendingProfessionals() {
    return this.reviewService.listPendingProfessionals();
  }

  @Patch('professionals/:id')
  async reviewProfessional(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.reviewService.reviewProfessional(id, user.id, dto);
  }
}
