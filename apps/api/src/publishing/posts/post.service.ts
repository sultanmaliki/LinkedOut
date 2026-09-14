import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRecord, PostRepository } from './post.repository';

export type PublicPostView = Omit<PostRecord, 'archivedAt' | 'archivedBefore'>;

interface Actor {
  professionalProfileId: string | null;
  companyId: string | null;
}

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<PostRecord> {
    const actor = await this.resolveActor(userId, dto.asCompanyId);

    return this.postRepository.create({
      professionalProfileId: actor.professionalProfileId,
      companyId: actor.companyId,
      content: dto.content,
      visibility: dto.visibility,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
  }

  async listPublicPosts(): Promise<PublicPostView[]> {
    const list = await this.postRepository.listVisible();

    return list.map((post) => this.toPublicView(post));
  }

  async getPost(postId: string): Promise<PublicPostView> {
    const post = await this.postRepository.findById(postId);

    if (!post || !this.isPubliclyVisible(post)) {
      throw new NotFoundException('Post not found');
    }

    return this.toPublicView(post);
  }

  async listMyPosts(userId: string): Promise<PostRecord[]> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return this.postRepository.listByProfessional(profile.id);
  }

  async listByCompanyId(companyId: string, userId: string): Promise<PostRecord[]> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    return this.postRepository.listByCompany(companyId);
  }

  async updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<PostRecord> {
    const post = await this.requireOwnership(postId, userId);

    const updated = await this.postRepository.updateContent(
      post.id,
      dto.content ?? post.content ?? '',
    );

    if (!updated) {
      throw new NotFoundException('Post not found');
    }

    return updated;
  }

  async archivePost(postId: string, userId: string): Promise<PostRecord> {
    await this.requireOwnership(postId, userId);

    const updated = await this.postRepository.archive(postId);

    if (!updated) {
      throw new NotFoundException('Post not found');
    }

    return updated;
  }

  async restorePost(postId: string, userId: string): Promise<PostRecord> {
    await this.requireOwnership(postId, userId);

    const updated = await this.postRepository.restore(postId);

    if (!updated) {
      throw new NotFoundException('Post not found');
    }

    return updated;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await this.requireOwnership(postId, userId);

    const deleted = await this.postRepository.deleteById(postId);

    if (!deleted) {
      throw new NotFoundException('Post not found');
    }
  }

  async isOwner(post: PostRecord, userId: string): Promise<boolean> {
    if (post.professionalProfileId) {
      const profile = await this.profileRepository.findByUserId(userId);
      return profile?.id === post.professionalProfileId;
    }

    if (post.companyId) {
      return this.companyRepository.isAdmin(post.companyId, userId);
    }

    return false;
  }

  private isPubliclyVisible(post: PostRecord): boolean {
    if (post.visibility === 'VISIBLE_NOW') {
      return true;
    }

    if (post.visibility === 'SCHEDULED' && post.scheduledAt) {
      return new Date(post.scheduledAt).getTime() <= Date.now();
    }

    return false;
  }

  private toPublicView(post: PostRecord): PublicPostView {
    const { archivedAt, archivedBefore, ...rest } = post;
    void archivedAt;
    void archivedBefore;
    return rest;
  }

  private async requireOwnership(postId: string, userId: string): Promise<PostRecord> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const owner = await this.isOwner(post, userId);

    if (!owner) {
      throw new ForbiddenException('You do not own this post');
    }

    return post;
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
