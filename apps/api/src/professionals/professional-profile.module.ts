import { Module } from '@nestjs/common';

import { ProfessionalProfileController } from './professional-profile.controller';
import { ProfessionalProfileRepository } from './professional-profile.repository';
import { ProfessionalProfileService } from './professional-profile.service';
import { EmploymentExpectationController } from './employment-expectation/employment-expectation.controller';
import { EmploymentExpectationRepository } from './employment-expectation/employment-expectation.repository';
import { EmploymentExpectationService } from './employment-expectation/employment-expectation.service';
import { EmploymentHistoryController } from './employment-history/employment-history.controller';
import { EmploymentHistoryRepository } from './employment-history/employment-history.repository';
import { EmploymentHistoryService } from './employment-history/employment-history.service';
import { EmploymentVerificationController } from './employment-verification/employment-verification.controller';
import { EmploymentVerificationRepository } from './employment-verification/employment-verification.repository';
import { EmploymentVerificationService } from './employment-verification/employment-verification.service';
import { PortfolioLinkController } from './portfolio-links/portfolio-link.controller';
import { PortfolioLinkRepository } from './portfolio-links/portfolio-link.repository';
import { PortfolioLinkService } from './portfolio-links/portfolio-link.service';
import { SkillController } from './skills/skill.controller';
import { SkillRepository } from './skills/skill.repository';
import { SkillService } from './skills/skill.service';

@Module({
  controllers: [
    ProfessionalProfileController,
    SkillController,
    PortfolioLinkController,
    EmploymentExpectationController,
    EmploymentHistoryController,
    EmploymentVerificationController,
  ],
  providers: [
    ProfessionalProfileRepository,
    ProfessionalProfileService,
    SkillRepository,
    SkillService,
    PortfolioLinkRepository,
    PortfolioLinkService,
    EmploymentExpectationRepository,
    EmploymentExpectationService,
    EmploymentHistoryRepository,
    EmploymentHistoryService,
    EmploymentVerificationRepository,
    EmploymentVerificationService,
  ],
  exports: [
    ProfessionalProfileRepository,
    EmploymentHistoryRepository,
    EmploymentVerificationRepository,
  ],
})
export class ProfessionalProfileModule {}
