"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const jwt_secret_1 = require("./jwt-secret");
const mailer_service_1 = require("./mailer.service");
const user_repository_1 = require("./user.repository");
let AuthService = class AuthService {
    userRepository;
    mailerService;
    jwtSecret = (0, jwt_secret_1.getJwtSecret)();
    constructor(userRepository, mailerService) {
        this.userRepository = userRepository;
        this.mailerService = mailerService;
    }
    async register(dto) {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
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
    async verifyEmail(dto) {
        let payload;
        try {
            payload = jwt.verify(dto.token, this.jwtSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired verification link');
        }
        if (payload.type !== 'email-verification') {
            throw new common_1.UnauthorizedException('Invalid or expired verification link');
        }
        const user = await this.userRepository.findById(payload.sub);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Single-use enforcement: once an account is verified there is nothing
        // left for any verification token (this one or an older leaked one) to
        // do, so reject rather than silently succeeding again. Also reject if
        // the token was issued for a different email than the account currently
        // has, so a token can't outlive an email change.
        if (user.emailVerified || payload.email !== user.email) {
            throw new common_1.UnauthorizedException('Invalid or expired verification link');
        }
        this.ensureAccountActive(user);
        await this.userRepository.markEmailVerified(user.id);
        // Clicking a valid link proves mailbox ownership -- treat it as a login
        // (fresh access + refresh tokens) so verifying on a different
        // device/browser than the one that registered doesn't strand the user
        // on a "verified!" page they still have to separately log in from.
        return this.buildAuthResponse({ ...user, emailVerified: true });
    }
    async resendVerification(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_1.ConflictException('Email is already verified');
        }
        const verificationToken = this.issueEmailVerificationToken(user.id, user.email);
        await this.mailerService.sendVerificationEmail(user.email, verificationToken);
        return {
            sent: true,
            ...(process.env.NODE_ENV !== 'production' ? { devVerificationToken: verificationToken } : {}),
        };
    }
    async forgotPassword(dto) {
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
    async resetPassword(dto) {
        let payload;
        try {
            payload = jwt.verify(dto.token, this.jwtSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired reset link');
        }
        if (payload.type !== 'password-reset') {
            throw new common_1.UnauthorizedException('Invalid or expired reset link');
        }
        const user = await this.userRepository.findById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset link');
        }
        // Single-use and supersedes-on-reissue, mirroring the refresh-token
        // rotation pattern: only the most recently issued reset token for this
        // account is accepted, so a used or superseded link is rejected.
        if (!payload.jti || payload.jti !== user.passwordResetTokenId) {
            throw new common_1.UnauthorizedException('Invalid or expired reset link');
        }
        this.ensureAccountActive(user);
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.updatePassword(user.id, passwordHash);
        // Resetting the password rotates the refresh token too (via
        // buildAuthResponse), invalidating every other existing session -- a
        // stolen session shouldn't survive the password reset it likely caused.
        return this.buildAuthResponse({ ...user, passwordHash });
    }
    async changePassword(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.updatePassword(user.id, passwordHash);
        return this.buildAuthResponse({ ...user, passwordHash });
    }
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.ensureAccountActive(user);
        return this.buildAuthResponse(user);
    }
    async refresh(dto) {
        let payload;
        try {
            payload = jwt.verify(dto.refreshToken, this.jwtSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.userRepository.findById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        this.ensureAccountActive(user);
        // Refresh tokens are single-use: each successful refresh rotates
        // activeRefreshTokenId to a new jti, so a token that has already been
        // redeemed (or was superseded by a login/refresh elsewhere) fails here
        // instead of being replayable for its full 7-day lifetime.
        if (!payload.jti || payload.jti !== user.activeRefreshTokenId) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return this.buildAuthResponse(user);
    }
    async logout(userId) {
        await this.userRepository.setActiveRefreshTokenId(userId, null);
    }
    ensureAccountActive(user) {
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
    }
    async buildAuthResponse(user, devVerificationToken) {
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
    issueEmailVerificationToken(userId, email) {
        return jwt.sign({
            sub: userId,
            email,
            type: 'email-verification',
        }, this.jwtSecret, {
            expiresIn: '24h',
        });
    }
    async issuePasswordResetToken(userId) {
        const tokenId = crypto.randomUUID();
        const token = jwt.sign({
            sub: userId,
            type: 'password-reset',
            jti: tokenId,
        }, this.jwtSecret, {
            expiresIn: '1h',
        });
        // Rotating this on every request supersedes any earlier unused reset
        // link for the account, mirroring activeRefreshTokenId's rotate-on-issue
        // pattern for refresh tokens.
        await this.userRepository.setPasswordResetTokenId(userId, tokenId);
        return token;
    }
    async issueTokens(userId, email, role) {
        const accessToken = jwt.sign({
            sub: userId,
            email,
            role,
            type: 'access',
        }, this.jwtSecret, {
            expiresIn: '15m',
        });
        const refreshTokenId = crypto.randomUUID();
        const refreshToken = jwt.sign({
            sub: userId,
            email,
            role,
            type: 'refresh',
            jti: refreshTokenId,
        }, this.jwtSecret, {
            expiresIn: '7d',
        });
        // Rotating this on every issuance (register/login/refresh) is what makes
        // the previous refresh token stop working the moment a new one is
        // issued -- see the jti check in refresh() above.
        await this.userRepository.setActiveRefreshTokenId(userId, refreshTokenId);
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        mailer_service_1.MailerService])
], AuthService);
