import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../company.repository';
import { CreateCompanyLocationDto } from './dto/create-company-location.dto';
import { UpdateCompanyLocationDto } from './dto/update-company-location.dto';
import { CompanyLocationRecord, CompanyLocationRepository } from './company-location.repository';

@Injectable()
export class CompanyLocationService {
  constructor(
    private readonly locationRepository: CompanyLocationRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async listLocations(companyId: string): Promise<CompanyLocationRecord[]> {
    await this.assertCompanyExists(companyId);

    return this.locationRepository.listByCompany(companyId);
  }

  async createLocation(
    companyId: string,
    userId: string,
    dto: CreateCompanyLocationDto,
  ): Promise<CompanyLocationRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    return this.locationRepository.create(companyId, dto);
  }

  async updateLocation(
    companyId: string,
    locationId: string,
    userId: string,
    dto: UpdateCompanyLocationDto,
  ): Promise<CompanyLocationRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    const existing = await this.locationRepository.findById(companyId, locationId);

    if (!existing) {
      throw new NotFoundException('Company location not found');
    }

    const updated = await this.locationRepository.updateById(companyId, locationId, dto);

    if (!updated) {
      throw new NotFoundException('Company location not found');
    }

    return updated;
  }

  async deleteLocation(companyId: string, locationId: string, userId: string): Promise<void> {
    await this.assertCompanyAdmin(companyId, userId);

    const deleted = await this.locationRepository.deleteById(companyId, locationId);

    if (!deleted) {
      throw new NotFoundException('Company location not found');
    }
  }

  private async assertCompanyExists(companyId: string): Promise<void> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private async assertCompanyAdmin(companyId: string, userId: string): Promise<void> {
    await this.assertCompanyExists(companyId);

    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }
  }
}
