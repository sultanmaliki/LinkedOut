import { Injectable, NotFoundException } from '@nestjs/common';

import { ProfessionalProfileRepository } from '../professional-profile.repository';
import { CreatePortfolioLinkDto } from './dto/create-portfolio-link.dto';
import { UpdatePortfolioLinkDto } from './dto/update-portfolio-link.dto';
import { PortfolioLinkRecord, PortfolioLinkRepository } from './portfolio-link.repository';

@Injectable()
export class PortfolioLinkService {
  constructor(
    private readonly linkRepository: PortfolioLinkRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async listMyLinks(userId: string): Promise<PortfolioLinkRecord[]> {
    const profileId = await this.requireProfileId(userId);

    return this.linkRepository.listByProfile(profileId);
  }

  async createLink(userId: string, dto: CreatePortfolioLinkDto): Promise<PortfolioLinkRecord> {
    const profileId = await this.requireProfileId(userId);

    return this.linkRepository.create(profileId, dto);
  }

  async updateLink(
    userId: string,
    linkId: string,
    dto: UpdatePortfolioLinkDto,
  ): Promise<PortfolioLinkRecord> {
    const profileId = await this.requireProfileId(userId);

    const existing = await this.linkRepository.findById(profileId, linkId);

    if (!existing) {
      throw new NotFoundException('Portfolio link not found');
    }

    const updated = await this.linkRepository.updateById(profileId, linkId, dto);

    if (!updated) {
      throw new NotFoundException('Portfolio link not found');
    }

    return updated;
  }

  async deleteLink(userId: string, linkId: string): Promise<void> {
    const profileId = await this.requireProfileId(userId);

    const deleted = await this.linkRepository.deleteById(profileId, linkId);

    if (!deleted) {
      throw new NotFoundException('Portfolio link not found');
    }
  }

  private async requireProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile.id;
  }
}
