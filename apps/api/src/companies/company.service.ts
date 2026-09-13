import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRecord, CompanyRepository } from './company.repository';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async createCompany(userId: string, dto: CreateCompanyDto): Promise<CompanyRecord> {
    const slug = await this.generateUniqueSlug(dto.displayName);

    return this.companyRepository.createWithProfileAndAdmin({ ...dto, slug }, userId);
  }

  async listCompanies(limit: number, offset: number): Promise<CompanyRecord[]> {
    return this.companyRepository.list(limit, offset);
  }

  async listMine(userId: string): Promise<CompanyRecord[]> {
    return this.companyRepository.listForAdmin(userId);
  }

  async getCompany(id: string): Promise<CompanyRecord> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompany(id: string, userId: string, dto: UpdateCompanyDto): Promise<CompanyRecord> {
    const existing = await this.companyRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(id, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    const updated = await this.companyRepository.updateById(id, dto);

    if (!updated) {
      throw new NotFoundException('Company not found');
    }

    return updated;
  }

  private async generateUniqueSlug(displayName: string): Promise<string> {
    const base = slugify(displayName) || 'company';
    let candidate = base;
    let attempt = 0;

    while (await this.companyRepository.slugExists(candidate)) {
      attempt += 1;

      if (attempt > 10) {
        throw new Error('Unable to generate a unique company slug');
      }

      candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    return candidate;
  }
}
