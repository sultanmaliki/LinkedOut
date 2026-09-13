import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CreatePortfolioLinkDto } from './dto/create-portfolio-link.dto';
import { UpdatePortfolioLinkDto } from './dto/update-portfolio-link.dto';
import { PortfolioLinkService } from './portfolio-link.service';

@Controller('professionals/me/portfolio-links')
@UseGuards(AuthGuard)
export class PortfolioLinkController {
  constructor(private readonly linkService: PortfolioLinkService) {}

  @Get()
  async listMyLinks(@CurrentUser() user: AuthenticatedUser) {
    return this.linkService.listMyLinks(user.id);
  }

  @Post()
  async createLink(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePortfolioLinkDto) {
    return this.linkService.createLink(user.id, dto);
  }

  @Patch(':linkId')
  async updateLink(
    @Param('linkId') linkId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePortfolioLinkDto,
  ) {
    return this.linkService.updateLink(user.id, linkId, dto);
  }

  @Delete(':linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLink(@Param('linkId') linkId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.linkService.deleteLink(user.id, linkId);
  }
}
