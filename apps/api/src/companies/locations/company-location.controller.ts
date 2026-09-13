import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CreateCompanyLocationDto } from './dto/create-company-location.dto';
import { UpdateCompanyLocationDto } from './dto/update-company-location.dto';
import { CompanyLocationService } from './company-location.service';

@Controller('companies/:companyId/locations')
export class CompanyLocationController {
  constructor(private readonly locationService: CompanyLocationService) {}

  @Get()
  async listLocations(@Param('companyId') companyId: string) {
    return this.locationService.listLocations(companyId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createLocation(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCompanyLocationDto,
  ) {
    return this.locationService.createLocation(companyId, user.id, dto);
  }

  @Patch(':locationId')
  @UseGuards(AuthGuard)
  async updateLocation(
    @Param('companyId') companyId: string,
    @Param('locationId') locationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCompanyLocationDto,
  ) {
    return this.locationService.updateLocation(companyId, locationId, user.id, dto);
  }

  @Delete(':locationId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocation(
    @Param('companyId') companyId: string,
    @Param('locationId') locationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.locationService.deleteLocation(companyId, locationId, user.id);
  }
}
