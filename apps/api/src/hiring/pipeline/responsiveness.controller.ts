import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { ResponsivenessScoreService } from './responsiveness-score.service';

// Both routes are self-only -- private for v1, per docs/architecture/hiring-pipeline-v2.md.
// Public display on a profile is a deliberately separate, later decision.
@Controller()
@UseGuards(AuthGuard)
export class ResponsivenessController {
  constructor(
    private readonly scoreService: ResponsivenessScoreService,
    private readonly profileRepository: ProfessionalProfileRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  @Get('professionals/me/responsiveness')
  async myResponsiveness(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.profileRepository.findByUserId(user.id);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return this.scoreService.getProfessionalScore(profile.id);
  }

  @Get('companies/:id/responsiveness')
  async companyResponsiveness(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const isAdmin = await this.companyRepository.isAdmin(id, user.id);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    return this.scoreService.getCompanyScore(id);
  }
}
