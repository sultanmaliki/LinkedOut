import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SetProfessionalSkillsDto } from './dto/set-professional-skills.dto';
import { SkillService } from './skill.service';

@Controller('professionals/me/skills')
@UseGuards(AuthGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  async listMySkills(@CurrentUser() user: AuthenticatedUser) {
    return this.skillService.listMySkills(user.id);
  }

  @Put()
  async setMySkills(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetProfessionalSkillsDto) {
    return this.skillService.setMySkills(user.id, dto);
  }
}
