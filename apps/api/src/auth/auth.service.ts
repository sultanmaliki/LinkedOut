import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'user',
    });

    const tokens = this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async refresh(dto: RefreshDto) {
    const payload = jwt.verify(dto.refreshToken, process.env.JWT_SECRET || 'dev-secret') as {
      sub: string;
      email: string;
      role: string;
    };

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  private issueTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { sub: userId, email, role },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = jwt.sign(
      { sub: userId, email, role, type: 'refresh' },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }
}
