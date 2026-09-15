import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthenticatedUser } from './guards/auth.guard';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    verifyEmail(dto: VerifyEmailDto): Promise<{
        verified: true;
    }>;
    resendVerification(user: AuthenticatedUser): Promise<{
        devVerificationToken?: string | undefined;
        sent: boolean;
    }>;
    logout(user: AuthenticatedUser): Promise<{
        loggedOut: boolean;
    }>;
}
