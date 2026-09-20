import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from './mailer.service';
import { UserRepository } from './user.repository';
export declare class AuthService {
    private readonly userRepository;
    private readonly mailerService;
    private readonly jwtSecret;
    private readonly devAuthTokensEnabled;
    constructor(userRepository: UserRepository, mailerService: MailerService);
    register(dto: RegisterDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    resendVerification(userId: string): Promise<{
        devVerificationToken?: string | undefined;
        sent: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        devResetToken?: string | undefined;
        sent: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        devVerificationToken?: string | undefined;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    logout(userId: string): Promise<void>;
    private ensureAccountActive;
    private buildAuthResponse;
    private issueEmailVerificationToken;
    private issuePasswordResetToken;
    private issueTokens;
}
