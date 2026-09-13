import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';
import { ModerationActionService } from './moderation-action.service';

@Controller('moderation/cases/:caseId/actions')
@UseGuards(AuthGuard, ModeratorGuard)
export class ModerationActionController {
  constructor(private readonly actionService: ModerationActionService) {}

  @Get()
  async listByCase(@Param('caseId') caseId: string) {
    return this.actionService.listByCase(caseId);
  }

  @Post()
  async createAction(
    @Param('caseId') caseId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateModerationActionDto,
  ) {
    return this.actionService.createAction(caseId, user.id, dto);
  }
}
