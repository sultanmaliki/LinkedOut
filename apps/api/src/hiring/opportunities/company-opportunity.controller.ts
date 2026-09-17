import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { OpportunityService } from './opportunity.service';

// The company-wide "opportunities we've sent" view -- previously only
// available per-job, buried behind a toggle on each job card. See
// docs/architecture/hiring-pipeline-v2.md.
@Controller('companies/:companyId/opportunities')
@UseGuards(AuthGuard)
export class CompanyOpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get()
  async listOpportunities(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.opportunityService.listByCompany(companyId, user.id);
  }
}
