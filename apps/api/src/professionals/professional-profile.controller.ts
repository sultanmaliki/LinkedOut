import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../auth/guards/auth.guard';
import { PublicCache } from '../common/decorators/public-cache.decorator';
import { ListProfessionalsDto } from './dto/list-professionals.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { EmploymentExpectationService } from './employment-expectation/employment-expectation.service';
import { PortfolioLinkService } from './portfolio-links/portfolio-link.service';
import { ProfessionalProfileService } from './professional-profile.service';
import { SkillService } from './skills/skill.service';

@Controller('professionals')
export class ProfessionalProfileController {
  constructor(
    private readonly profileService: ProfessionalProfileService,
    private readonly skillService: SkillService,
    private readonly portfolioLinkService: PortfolioLinkService,
    private readonly employmentExpectationService: EmploymentExpectationService,
  ) {}

  @PublicCache()
  @Get()
  async searchProfiles(@Query() query: ListProfessionalsDto) {
    return this.profileService.searchProfiles(query);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMyProfile(user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfessionalProfileDto,
  ) {
    return this.profileService.updateMyProfile(user.id, dto);
  }

  @PublicCache()
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @PublicCache()
  @Get(':id/skills')
  async getProfileSkills(@Param('id') id: string) {
    return this.skillService.listForProfileId(id);
  }

  @PublicCache()
  @Get(':id/portfolio-links')
  async getProfilePortfolioLinks(@Param('id') id: string) {
    return this.portfolioLinkService.listForProfileId(id);
  }

  @PublicCache()
  @Get(':id/employment-expectation')
  async getProfileEmploymentExpectation(@Param('id') id: string) {
    return this.employmentExpectationService.getForProfileId(id);
  }
}
