import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [AuthController, UserController],
  providers: [AuthService, UserRepository, UserService],
  exports: [AuthService],
})
export class AuthModule {}
