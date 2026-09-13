import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { LikeService } from './like.service';

@Controller('posts/:postId/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get()
  async getLikeCount(@Param('postId') postId: string) {
    return this.likeService.getLikeCount(postId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async toggleLike(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ToggleLikeDto,
  ) {
    return this.likeService.toggleLike(postId, user.id, dto.asCompanyId);
  }
}
