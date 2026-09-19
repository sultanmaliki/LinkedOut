import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { getJwtSecret } from './jwt-secret';
import { MailerService } from './mailer.service';
import { UserRepository, UserRecord } from './user.repository';

interface EmailVerificationPayload {
  sub: string;
  email: string;
  type: 'email-verification';
}

interface PasswordResetPayload {
  sub: string;
  type: 'password-reset';
  jti: string;
}

interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: string;
  type?: string;
  jti?: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = getJwtSecret();

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
    await this.mailerService.sendVerificationEmail(user.email, verificationToken);

    return this.buildAuthResponse(user, verificationToken);
  }

  async verifyEmail(dto: VerifyEmailDto) {
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

    // Single-use enforcement: once an account is verified there is nothing
    // left for any verification token (this one or an older leaked one) to
    // do, so reject rather than silently succeeding again. Also reject if
    // the token was issued for a different email than the account currently
    // has, so a token can't outlive an email change.
    if (user.emailVerified || payload.email !== user.email) {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    this.ensureAccountActive(user);

    await this.userRepository.markEmailVerified(user.id);

    // Clicking a valid link proves mailbox ownership -- treat it as a login
    // (fresh access + refresh tokens) so verifying on a different
    // device/browser than the one that registered doesn't strand the user
    // on a "verified!" page they still have to separately log in from.
    return this.buildAuthResponse({ ...user, emailVerified: true });
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
    await this.mailerService.sendVerificationEmail(user.email, verificationToken);

    return {
      sent: true,
      ...(process.env.NODE_ENV !== 'production' ? { devVerificationToken: verificationToken } : {}),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    // Identical response whether or not the account exists (or is active),
    // so this endpoint can't be used to test which emails are registered.
    if (!user || user.status !== 'ACTIVE') {
      return { sent: true };
    }

    const resetToken = await this.issuePasswordResetToken(user.id);
    await this.mailerService.sendPasswordResetEmail(user.email, resetToken);

    return {
      sent: true,
      ...(process.env.NODE_ENV !== 'production' ? { devResetToken: resetToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: PasswordResetPayload;

    try {
      payload = jwt.verify(dto.token, this.jwtSecret) as PasswordResetPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    if (payload.type !== 'password-reset') {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    // Single-use and supersedes-on-reissue, mirroring the refresh-token
    // rotation pattern: only the most recently issued reset token for this
    // account is accepted, so a used or superseded link is rejected.
    if (!payload.jti || payload.jti !== user.passwordResetTokenId) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    this.ensureAccountActive(user);

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(user.id, passwordHash);

    // Resetting the password rotates the refresh token too (via
    // buildAuthResponse), invalidating every other existing session -- a
    // stolen session shouldn't survive the password reset it likely caused.
    return this.buildAuthResponse({ ...user, passwordHash });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(user.id, passwordHash);

    return this.buildAuthResponse({ ...user, passwordHash });
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
    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(dto.refreshToken, this.jwtSecret) as RefreshTokenPayload;
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

    // Refresh tokens are single-use: each successful refresh rotates
    // activeRefreshTokenId to a new jti, so a token that has already been
    // redeemed (or was superseded by a login/refresh elsewhere) fails here
    // instead of being replayable for its full 7-day lifetime.
    if (!payload.jti || payload.jti !== user.activeRefreshTokenId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.setActiveRefreshTokenId(userId, null);
  }

  private ensureAccountActive(user: UserRecord) {
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }
  }

  private async buildAuthResponse(user: UserRecord, devVerificationToken?: string) {
    const tokens = await this.issueTokens(user.id, user.email, user.role);

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

  private async issuePasswordResetToken(userId: string): Promise<string> {
    const tokenId = crypto.randomUUID();

    const token = jwt.sign(
      {
        sub: userId,
        type: 'password-reset',
        jti: tokenId,
      },
      this.jwtSecret,
      {
        expiresIn: '1h',
      },
    );

    // Rotating this on every request supersedes any earlier unused reset
    // link for the account, mirroring activeRefreshTokenId's rotate-on-issue
    // pattern for refresh tokens.
    await this.userRepository.setPasswordResetTokenId(userId, tokenId);

    return token;
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
        type: 'access',
      },
      this.jwtSecret,
      {
        expiresIn: '15m',
      },
    );

    const refreshTokenId = crypto.randomUUID();

    const refreshToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
        type: 'refresh',
        jti: refreshTokenId,
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );

    // Rotating this on every issuance (register/login/refresh) is what makes
    // the previous refresh token stop working the moment a new one is
    // issued -- see the jti check in refresh() above.
    await this.userRepository.setActiveRefreshTokenId(userId, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
