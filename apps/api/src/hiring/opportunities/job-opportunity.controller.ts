import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { VerifiedEmailGuard } from '../../auth/guards/verified-email.guard';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { OpportunityService } from './opportunity.service';

@Controller('jobs/:jobId/opportunities')
@UseGuards(AuthGuard)
export class JobOpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @UseGuards(VerifiedEmailGuard)
  async createOpportunity(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunityService.createOpportunity(jobId, user.id, dto);
  }

  @Get()
  async listOpportunities(@Param('jobId') jobId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.opportunityService.listByJob(jobId, user.id);
  }
}
