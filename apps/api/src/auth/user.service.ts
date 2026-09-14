import { type userRoleEnum } from '@linkedout/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { SafeUserRecord, UserRepository } from './user.repository';

function toSafeUser(user: {
  id: string;
  email: string;
  role: string;
  status: string;
}): SafeUserRecord {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status as SafeUserRecord['status'],
  };
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async lookupByEmail(email: string): Promise<SafeUserRecord> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toSafeUser(user);
  }

  async updateRole(
    id: string,
    role: (typeof userRoleEnum.enumValues)[number],
  ): Promise<SafeUserRecord> {
    const updated = await this.userRepository.updateRole(id, role);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
