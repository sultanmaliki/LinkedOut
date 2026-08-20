import { Module } from '@nestjs/common';

import { ProfessionalProfileController } from './professional-profile.controller';
import { ProfessionalProfileRepository } from './professional-profile.repository';
import { ProfessionalProfileService } from './professional-profile.service';

@Module({
  controllers: [ProfessionalProfileController],
  providers: [ProfessionalProfileRepository, ProfessionalProfileService],
})
export class ProfessionalProfileModule {}
