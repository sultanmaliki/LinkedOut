import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SubmitCompanyReplyDto } from './dto/submit-company-reply.dto';
import { CompanyReplyService } from './company-reply.service';

@Controller('reviews/:reviewId/reply')
@UseGuards(AuthGuard)
export class CompanyReplyController {
  constructor(private readonly replyService: CompanyReplyService) {}

  @Post()
  async createReply(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCompanyReplyDto,
  ) {
    return this.replyService.createReply(reviewId, user.id, dto);
  }

  @Put()
  async updateReply(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCompanyReplyDto,
  ) {
    return this.replyService.updateReply(reviewId, user.id, dto);
  }
}
