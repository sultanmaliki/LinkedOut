import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { SetCompanyBenefitsDto } from './dto/set-company-benefits.dto';
import { CompanyBenefitService } from './company-benefit.service';

@Controller('companies/:companyId/benefits')
export class CompanyBenefitController {
  constructor(private readonly benefitService: CompanyBenefitService) {}

  @Get()
  async listBenefits(@Param('companyId') companyId: string) {
    return this.benefitService.listBenefits(companyId);
  }

  @Put()
  @UseGuards(AuthGuard)
  async setBenefits(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetCompanyBenefitsDto,
  ) {
    return this.benefitService.setBenefits(companyId, user.id, dto);
  }
}
