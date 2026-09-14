import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { PostService } from './post.service';

@Controller('companies/:companyId/posts')
@UseGuards(AuthGuard)
export class CompanyPostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async listCompanyPosts(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postService.listByCompanyId(companyId, user.id);
  }
}
