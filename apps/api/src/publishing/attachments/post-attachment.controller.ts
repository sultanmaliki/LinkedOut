import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Controller('posts/:postId/attachments')
export class PostAttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get()
  async listByPost(@Param('postId') postId: string) {
    return this.attachmentService.listByPost(postId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createForPost(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.attachmentService.createForPost(postId, user.id, dto);
  }

  @Delete(':attachmentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFromPost(
    @Param('postId') postId: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.attachmentService.deleteFromPost(postId, attachmentId, user.id);
  }
}
