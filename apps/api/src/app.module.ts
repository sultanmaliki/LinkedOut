import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ProfessionalProfileModule } from './professionals/professional-profile.module';

@Module({
  imports: [AuthModule, ProfessionalProfileModule],
})
export class AppModule {}
