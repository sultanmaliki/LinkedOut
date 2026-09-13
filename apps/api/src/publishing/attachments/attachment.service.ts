import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PostRepository } from '../posts/post.repository';
import { PostService } from '../posts/post.service';
import { AttachmentRecord, AttachmentRepository } from './attachment.repository';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly postRepository: PostRepository,
    private readonly postService: PostService,
  ) {}

  async createStandalone(dto: CreateAttachmentDto): Promise<AttachmentRecord> {
    if (dto.type !== 'PDF') {
      throw new ConflictException('Only standalone PDF attachments are allowed without a post');
    }

    return this.attachmentRepository.create({ postId: null, ...dto });
  }

  async createForPost(
    postId: string,
    userId: string,
    dto: CreateAttachmentDto,
  ): Promise<AttachmentRecord> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isOwner = await this.postService.isOwner(post, userId);

    if (!isOwner) {
      throw new ForbiddenException('You do not own this post');
    }

    return this.attachmentRepository.create({ postId, ...dto });
  }

  async listByPost(postId: string): Promise<AttachmentRecord[]> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.attachmentRepository.listByPost(postId);
  }

  async getAttachment(attachmentId: string): Promise<AttachmentRecord> {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async deleteFromPost(postId: string, attachmentId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isOwner = await this.postService.isOwner(post, userId);

    if (!isOwner) {
      throw new ForbiddenException('You do not own this post');
    }

    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment || attachment.postId !== postId) {
      throw new NotFoundException('Attachment not found');
    }

    await this.attachmentRepository.deleteById(attachmentId);
  }
}
