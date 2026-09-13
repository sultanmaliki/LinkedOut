import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { CreateTrustFlagDto } from './dto/create-trust-flag.dto';
import { TrustFlagService } from './trust-flag.service';

@Controller('moderation/trust-flags')
@UseGuards(AuthGuard, ModeratorGuard)
export class TrustFlagController {
  constructor(private readonly trustFlagService: TrustFlagService) {}

  @Post()
  async createFlag(@Body() dto: CreateTrustFlagDto) {
    return this.trustFlagService.createFlag(dto);
  }

  @Get('user/:userId')
  async listForUser(@Param('userId') userId: string) {
    return this.trustFlagService.listForUser(userId);
  }
}
