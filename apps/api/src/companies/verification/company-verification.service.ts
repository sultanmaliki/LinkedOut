import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../company.repository';
import { SubmitCompanyVerificationDto } from './dto/submit-company-verification.dto';
import {
  CompanyVerificationRecord,
  CompanyVerificationRepository,
} from './company-verification.repository';

@Injectable()
export class CompanyVerificationService {
  constructor(
    private readonly verificationRepository: CompanyVerificationRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async getVerification(companyId: string, userId: string): Promise<CompanyVerificationRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    const verification = await this.verificationRepository.findByCompanyId(companyId);

    if (!verification) {
      throw new NotFoundException('Company verification not found');
    }

    return verification;
  }

  async submitVerification(
    companyId: string,
    userId: string,
    dto: SubmitCompanyVerificationDto,
  ): Promise<CompanyVerificationRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    return this.verificationRepository.upsert(companyId, dto);
  }

  private async assertCompanyAdmin(companyId: string, userId: string): Promise<void> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }
  }
}
