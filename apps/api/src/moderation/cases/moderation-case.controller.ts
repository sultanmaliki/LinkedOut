import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { CreateModerationCaseDto } from './dto/create-moderation-case.dto';
import { ListModerationCasesDto } from './dto/list-moderation-cases.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { ModerationCaseService } from './moderation-case.service';

@Controller('moderation/cases')
@UseGuards(AuthGuard)
export class ModerationCaseController {
  constructor(private readonly caseService: ModerationCaseService) {}

  @Post()
  async createCase(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateModerationCaseDto) {
    return this.caseService.createCase(user.id, dto);
  }

  @Get()
  @UseGuards(ModeratorGuard)
  async listCases(@Query() query: ListModerationCasesDto) {
    return this.caseService.listCases(query);
  }

  @Get(':id')
  @UseGuards(ModeratorGuard)
  async getCase(@Param('id') id: string) {
    return this.caseService.getCase(id);
  }

  @Patch(':id/status')
  @UseGuards(ModeratorGuard)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    return this.caseService.updateStatus(id, user.id, dto);
  }
}
