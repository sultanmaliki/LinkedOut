import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { OpportunityService } from './opportunity.service';

@Controller('opportunities')
@UseGuards(AuthGuard)
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get(':id')
  async getOpportunity(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.opportunityService.getOpportunity(id, user.id);
  }
}
