import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { PostRepository } from '../posts/post.repository';
import { CommentRecord, CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

interface Actor {
  professionalProfileId: string | null;
  companyId: string | null;
}

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async createComment(
    postId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentRecord> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (dto.parentCommentId) {
      const parent = await this.commentRepository.findById(dto.parentCommentId);

      if (!parent || parent.postId !== postId) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parent.parentCommentId) {
        throw new ConflictException('Comments only support one level of replies');
      }
    }

    const actor = await this.resolveActor(userId, dto.asCompanyId);

    return this.commentRepository.create({
      postId,
      professionalProfileId: actor.professionalProfileId,
      companyId: actor.companyId,
      parentCommentId: dto.parentCommentId ?? null,
      content: dto.content,
    });
  }

  async listByPost(postId: string): Promise<CommentRecord[]> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.commentRepository.listByPost(postId);
  }

  async updateComment(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentRecord> {
    await this.requireOwnership(commentId, userId);

    const updated = await this.commentRepository.updateContent(commentId, dto.content);

    if (!updated) {
      throw new NotFoundException('Comment not found');
    }

    return updated;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    await this.requireOwnership(commentId, userId);

    const deleted = await this.commentRepository.deleteById(commentId);

    if (!deleted) {
      throw new NotFoundException('Comment not found');
    }
  }

  private async requireOwnership(commentId: string, userId: string): Promise<CommentRecord> {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    let isOwner = false;

    if (comment.professionalProfileId) {
      const profile = await this.profileRepository.findByUserId(userId);
      isOwner = profile?.id === comment.professionalProfileId;
    } else if (comment.companyId) {
      isOwner = await this.companyRepository.isAdmin(comment.companyId, userId);
    }

    if (!isOwner) {
      throw new ForbiddenException('You do not own this comment');
    }

    return comment;
  }

  private async resolveActor(userId: string, asCompanyId?: string): Promise<Actor> {
    if (asCompanyId) {
      const company = await this.companyRepository.findById(asCompanyId);

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const isAdmin = await this.companyRepository.isAdmin(asCompanyId, userId);

      if (!isAdmin) {
        throw new ForbiddenException('You do not manage this company');
      }

      return { professionalProfileId: null, companyId: asCompanyId };
    }

    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return { professionalProfileId: profile.id, companyId: null };
  }
}
