import { Module } from '@nestjs/common';

import { CompanyModule } from '../companies/company.module';
import { ProfessionalProfileModule } from '../professionals/professional-profile.module';
import { AttachmentController } from './attachments/attachment.controller';
import { AttachmentRepository } from './attachments/attachment.repository';
import { AttachmentService } from './attachments/attachment.service';
import { PostAttachmentController } from './attachments/post-attachment.controller';
import { CommentController } from './comments/comment.controller';
import { CommentRepository } from './comments/comment.repository';
import { CommentService } from './comments/comment.service';
import { PostCommentController } from './comments/post-comment.controller';
import { LikeController } from './likes/like.controller';
import { LikeRepository } from './likes/like.repository';
import { LikeService } from './likes/like.service';
import { MyPostController } from './posts/my-post.controller';
import { PostController } from './posts/post.controller';
import { PostRepository } from './posts/post.repository';
import { PostService } from './posts/post.service';

@Module({
  imports: [CompanyModule, ProfessionalProfileModule],
  controllers: [
    PostController,
    MyPostController,
    PostAttachmentController,
    AttachmentController,
    PostCommentController,
    CommentController,
    LikeController,
  ],
  providers: [
    PostRepository,
    PostService,
    AttachmentRepository,
    AttachmentService,
    CommentRepository,
    CommentService,
    LikeRepository,
    LikeService,
  ],
})
export class PublishingModule {}
