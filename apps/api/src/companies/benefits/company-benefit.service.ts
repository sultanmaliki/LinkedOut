import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../company.repository';
import { SetCompanyBenefitsDto } from './dto/set-company-benefits.dto';
import { CompanyBenefitRecord, CompanyBenefitRepository } from './company-benefit.repository';

@Injectable()
export class CompanyBenefitService {
  constructor(
    private readonly benefitRepository: CompanyBenefitRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async listBenefits(companyId: string): Promise<CompanyBenefitRecord[]> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.benefitRepository.listByCompany(companyId);
  }

  async setBenefits(
    companyId: string,
    userId: string,
    dto: SetCompanyBenefitsDto,
  ): Promise<CompanyBenefitRecord[]> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    return this.benefitRepository.replaceForCompany(companyId, dto.benefits);
  }
}
