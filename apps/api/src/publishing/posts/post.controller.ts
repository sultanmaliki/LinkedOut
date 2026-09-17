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
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePostDto) {
    return this.postService.createPost(user.id, dto);
  }

  @Get()
  async listPosts(@Query() query: ListPostsDto) {
    return this.postService.listPublicPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, user.id, dto);
  }

  @Post(':id/archive')
  @UseGuards(AuthGuard)
  async archivePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postService.archivePost(id, user.id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard)
  async restorePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postService.restorePost(id, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.postService.deletePost(id, user.id);
  }
}
