import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailerService } from './mailer.service';
import { UserRepository, UserRecord } from './user.repository';

interface EmailVerificationPayload {
  sub: string;
  email: string;
  type: 'email-verification';
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
  ) {}

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
      role: 'PROFESSIONAL',
    });

    const verificationToken = this.issueEmailVerificationToken(user.id, user.email);
    this.mailerService.sendVerificationEmail(user.email, verificationToken);

    return this.buildAuthResponse(user, verificationToken);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ verified: true }> {
    let payload: EmailVerificationPayload;

    try {
      payload = jwt.verify(dto.token, this.jwtSecret) as EmailVerificationPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    if (payload.type !== 'email-verification') {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.emailVerified) {
      await this.userRepository.markEmailVerified(user.id);
    }

    return { verified: true };
  }

  async resendVerification(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }

    const verificationToken = this.issueEmailVerificationToken(user.id, user.email);
    this.mailerService.sendVerificationEmail(user.email, verificationToken);

    return {
      sent: true,
      ...(process.env.NODE_ENV !== 'production' ? { devVerificationToken: verificationToken } : {}),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.ensureAccountActive(user);

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshDto) {
    let payload: {
      sub: string;
      email: string;
      role: string;
      type?: string;
    };

    try {
      payload = jwt.verify(dto.refreshToken, this.jwtSecret) as {
        sub: string;
        email: string;
        role: string;
        type?: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.ensureAccountActive(user);

    return this.buildAuthResponse(user);
  }

  private ensureAccountActive(user: UserRecord) {
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }
  }

  private buildAuthResponse(user: UserRecord, devVerificationToken?: string) {
    const tokens = this.issueTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...tokens,
      // Dev-only convenience since no real mailer is wired up yet: lets the
      // frontend/tester verify without digging through server logs. Never
      // included in production.
      ...(devVerificationToken && process.env.NODE_ENV !== 'production'
        ? { devVerificationToken }
        : {}),
    };
  }

  private issueEmailVerificationToken(userId: string, email: string): string {
    return jwt.sign(
      {
        sub: userId,
        email,
        type: 'email-verification',
      },
      this.jwtSecret,
      {
        expiresIn: '24h',
      },
    );
  }

  private issueTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
      },
      this.jwtSecret,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
        type: 'refresh',
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
