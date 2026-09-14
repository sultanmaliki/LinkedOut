import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';

import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard, AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('lookup')
  async lookupByEmail(@Query('email') email: string) {
    return this.userService.lookupByEmail(email);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRole(id, dto.role);
  }
}
