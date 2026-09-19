import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { VerifiedEmailGuard } from '../../auth/guards/verified-email.guard';
import { SubmitCompanyReplyDto } from './dto/submit-company-reply.dto';
import { CompanyReplyService } from './company-reply.service';

@Controller('reviews/:reviewId/reply')
export class CompanyReplyController {
  constructor(private readonly replyService: CompanyReplyService) {}

  @Get()
  async getReply(@Param('reviewId') reviewId: string) {
    return this.replyService.getReply(reviewId);
  }

  @Post()
  @UseGuards(AuthGuard, VerifiedEmailGuard)
  async createReply(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCompanyReplyDto,
  ) {
    return this.replyService.createReply(reviewId, user.id, dto);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateReply(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCompanyReplyDto,
  ) {
    return this.replyService.updateReply(reviewId, user.id, dto);
  }
}
