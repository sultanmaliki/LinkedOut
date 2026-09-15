import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './companies/company.module';
import { ContactModule } from './contact/contact.module';
import { HiringModule } from './hiring/hiring.module';
import { ModerationModule } from './moderation/moderation.module';
import { ProfessionalProfileModule } from './professionals/professional-profile.module';
import { PublishingModule } from './publishing/publishing.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    AuthModule,
    ProfessionalProfileModule,
    CompanyModule,
    ReviewModule,
    HiringModule,
    PublishingModule,
    ModerationModule,
    ContactModule,
  ],
})
export class AppModule {}
