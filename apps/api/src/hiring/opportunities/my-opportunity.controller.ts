import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { RespondToOfferDto } from './dto/respond-to-offer.dto';
import { RespondToOpportunityDto } from './dto/respond-to-opportunity.dto';
import { OpportunityService } from './opportunity.service';

@Controller('professionals/me/opportunities')
@UseGuards(AuthGuard)
export class MyOpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get()
  async listMyOpportunities(@CurrentUser() user: AuthenticatedUser) {
    return this.opportunityService.listMyOpportunities(user.id);
  }

  @Post(':opportunityId/respond')
  async respond(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RespondToOpportunityDto,
  ) {
    return this.opportunityService.respond(opportunityId, user.id, dto);
  }

  @Post(':opportunityId/withdraw')
  async withdraw(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.opportunityService.withdraw(opportunityId, user.id);
  }

  @Post(':opportunityId/respond-to-offer')
  async respondToOffer(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RespondToOfferDto,
  ) {
    return this.opportunityService.respondToOffer(opportunityId, user.id, dto.accepted);
  }

  @Post(':opportunityId/flag-unresponsive')
  async flagUnresponsive(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.opportunityService.flagUnresponsive(opportunityId, user.id);
  }
}
