import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { PostService } from './post.service';

@Controller('professionals/me/posts')
@UseGuards(AuthGuard)
export class MyPostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async listMyPosts(@CurrentUser() user: AuthenticatedUser) {
    return this.postService.listMyPosts(user.id);
  }
}
