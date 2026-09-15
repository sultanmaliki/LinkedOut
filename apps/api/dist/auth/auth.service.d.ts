import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailerService } from './mailer.service';
import { UserRepository } from './user.repository';
export declare class AuthService {
    private readonly userRepository;
    private readonly mailerService;
    private readonly jwtSecret;
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
        verified: true;
    }>;
    resendVerification(userId: string): Promise<{
        devVerificationToken?: string | undefined;
        sent: boolean;
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
    private issueTokens;
}
