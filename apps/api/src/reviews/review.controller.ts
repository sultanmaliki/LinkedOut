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

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../auth/guards/auth.guard';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard, VerifiedEmailGuard)
  async createReview(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(user.id, dto);
  }

  @Get(':id')
  async getReview(@Param('id') id: string) {
    return this.reviewService.getReview(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.reviewService.deleteReview(id, user.id);
  }
}
