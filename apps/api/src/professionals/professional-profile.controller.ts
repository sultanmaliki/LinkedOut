import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../auth/guards/auth.guard';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { ProfessionalProfileService } from './professional-profile.service';

@Controller('professionals')
export class ProfessionalProfileController {
  constructor(private readonly profileService: ProfessionalProfileService) {}

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
}
