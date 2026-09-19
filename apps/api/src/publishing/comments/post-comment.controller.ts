import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { VerifiedEmailGuard } from '../../auth/guards/verified-email.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class PostCommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async listByPost(@Param('postId') postId: string) {
    return this.commentService.listByPost(postId);
  }

  @Post()
  @UseGuards(AuthGuard, VerifiedEmailGuard)
  async createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createComment(postId, user.id, dto);
  }
}
