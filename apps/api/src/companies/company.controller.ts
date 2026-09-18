import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../auth/guards/auth.guard';
import { PublicCache } from '../common/decorators/public-cache.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesDto } from './dto/list-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createCompany(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCompanyDto) {
    return this.companyService.createCompany(user.id, dto);
  }

  @PublicCache()
  @Get()
  async listCompanies(@Query() query: ListCompaniesDto) {
    return this.companyService.listCompanies(query.limit ?? 20, query.offset ?? 0, query.q);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  async listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.companyService.listMine(user.id);
  }

  @PublicCache()
  @Get(':id')
  async getCompany(@Param('id') id: string) {
    return this.companyService.getCompany(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateCompany(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(id, user.id, dto);
  }
}
