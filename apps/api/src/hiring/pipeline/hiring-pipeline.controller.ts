import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { AppendPipelineStageDto } from './dto/append-pipeline-stage.dto';
import { HiringPipelineService } from './hiring-pipeline.service';

@Controller('opportunities/:opportunityId/pipeline')
@UseGuards(AuthGuard)
export class HiringPipelineController {
  constructor(private readonly pipelineService: HiringPipelineService) {}

  @Get()
  async listStages(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pipelineService.listStages(opportunityId, user.id);
  }

  @Post()
  async appendStage(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AppendPipelineStageDto,
  ) {
    return this.pipelineService.appendStage(opportunityId, user.id, dto);
  }
}
