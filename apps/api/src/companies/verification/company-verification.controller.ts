import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SubmitCompanyVerificationDto } from './dto/submit-company-verification.dto';
import { CompanyVerificationService } from './company-verification.service';

@Controller('companies/:companyId/verification')
@UseGuards(AuthGuard)
export class CompanyVerificationController {
  constructor(private readonly verificationService: CompanyVerificationService) {}

  @Get()
  async getVerification(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.verificationService.getVerification(companyId, user.id);
  }

  @Put()
  async submitVerification(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCompanyVerificationDto,
  ) {
    return this.verificationService.submitVerification(companyId, user.id, dto);
  }
}
