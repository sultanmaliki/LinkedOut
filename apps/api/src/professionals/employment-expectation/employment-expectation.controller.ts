import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SetEmploymentExpectationDto } from './dto/set-employment-expectation.dto';
import { EmploymentExpectationService } from './employment-expectation.service';

@Controller('professionals/me/employment-expectation')
@UseGuards(AuthGuard)
export class EmploymentExpectationController {
  constructor(private readonly expectationService: EmploymentExpectationService) {}

  @Get()
  async getMyExpectation(@CurrentUser() user: AuthenticatedUser) {
    return this.expectationService.getMyExpectation(user.id);
  }

  @Put()
  async setMyExpectation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetEmploymentExpectationDto,
  ) {
    return this.expectationService.setMyExpectation(user.id, dto);
  }
}
