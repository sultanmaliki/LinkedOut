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
import { CreateEmploymentHistoryDto } from './dto/create-employment-history.dto';
import { UpdateEmploymentHistoryDto } from './dto/update-employment-history.dto';
import { EmploymentHistoryService } from './employment-history.service';

@Controller('professionals/me/employment-history')
@UseGuards(AuthGuard)
export class EmploymentHistoryController {
  constructor(private readonly historyService: EmploymentHistoryService) {}

  @Get()
  async listMyHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.historyService.listMyHistory(user.id);
  }

  @Post()
  async createHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmploymentHistoryDto,
  ) {
    return this.historyService.createHistory(user.id, dto);
  }

  @Patch(':historyId')
  async updateHistory(
    @Param('historyId') historyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEmploymentHistoryDto,
  ) {
    return this.historyService.updateHistory(user.id, historyId, dto);
  }

  @Delete(':historyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistory(
    @Param('historyId') historyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.historyService.deleteHistory(user.id, historyId);
  }
}
