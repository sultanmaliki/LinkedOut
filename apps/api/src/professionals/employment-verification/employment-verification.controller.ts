import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SubmitEmploymentVerificationDto } from './dto/submit-employment-verification.dto';
import { EmploymentVerificationService } from './employment-verification.service';

@Controller('professionals/me/employment-history/:historyId/verification')
@UseGuards(AuthGuard)
export class EmploymentVerificationController {
  constructor(private readonly verificationService: EmploymentVerificationService) {}

  @Get()
  async getVerification(
    @Param('historyId') historyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.verificationService.getVerification(user.id, historyId);
  }

  @Put()
  async submitVerification(
    @Param('historyId') historyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitEmploymentVerificationDto,
  ) {
    return this.verificationService.submitVerification(user.id, historyId, dto);
  }
}
