import { Module } from '@nestjs/common';

import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { CompanyBenefitController } from './benefits/company-benefit.controller';
import { CompanyBenefitRepository } from './benefits/company-benefit.repository';
import { CompanyBenefitService } from './benefits/company-benefit.service';
import { CompanyLocationController } from './locations/company-location.controller';
import { CompanyLocationRepository } from './locations/company-location.repository';
import { CompanyLocationService } from './locations/company-location.service';
import { CompanyVerificationController } from './verification/company-verification.controller';
import { CompanyVerificationRepository } from './verification/company-verification.repository';
import { CompanyVerificationService } from './verification/company-verification.service';

@Module({
  controllers: [
    CompanyController,
    CompanyLocationController,
    CompanyVerificationController,
    CompanyBenefitController,
  ],
  providers: [
    CompanyRepository,
    CompanyService,
    CompanyLocationRepository,
    CompanyLocationService,
    CompanyVerificationRepository,
    CompanyVerificationService,
    CompanyBenefitRepository,
    CompanyBenefitService,
  ],
  exports: [CompanyRepository],
})
export class CompanyModule {}
