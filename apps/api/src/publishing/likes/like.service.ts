import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { PostRepository } from '../posts/post.repository';
import { LikeActor, LikeRepository } from './like.repository';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly postRepository: PostRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async toggleLike(
    postId: string,
    userId: string,
    asCompanyId?: string,
  ): Promise<{ liked: boolean }> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const actor = await this.resolveActor(userId, asCompanyId);

    const existing = await this.likeRepository.findByActor(postId, actor);

    if (existing) {
      await this.likeRepository.deleteByActor(postId, actor);
      return { liked: false };
    }

    await this.likeRepository.create(postId, actor);
    return { liked: true };
  }

  async getLikeStatus(postId: string, userId?: string): Promise<{ count: number; liked: boolean }> {
    // Independent reads — run concurrently rather than paying two
    // sequential round trips (each ~287ms to our Supabase region).
    const [post, count] = await Promise.all([
      this.postRepository.findById(postId),
      this.likeRepository.countByPost(postId),
    ]);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!userId) {
      return { count, liked: false };
    }

    // Matches how the frontend always likes as the caller's professional
    // profile (no asCompanyId on the toggle route from the feed), so that's
    // the only actor checked here. A profile-less caller (e.g. company-only
    // account) simply can't have liked anything yet.
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      return { count, liked: false };
    }

    const existing = await this.likeRepository.findByActor(postId, {
      professionalProfileId: profile.id,
      companyId: null,
    });

    return { count, liked: Boolean(existing) };
  }

  private async resolveActor(userId: string, asCompanyId?: string): Promise<LikeActor> {
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
