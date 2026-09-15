import { type userRoleEnum } from '@linkedout/database';
export interface UserRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BANNED';
    emailVerified: boolean;
    activeRefreshTokenId: string | null;
}
export interface SafeUserRecord {
    id: string;
    email: string;
    role: string;
    status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BANNED';
}
export interface CreateUserData {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
}
export declare class UserRepository {
    findByEmail(email: string): Promise<UserRecord | undefined>;
    findById(id: string): Promise<UserRecord | undefined>;
    /**
     * Lightweight status lookup used by AuthGuard on every authenticated
     * request. Deliberately avoids the professionalProfiles join and
     * passwordHash column that findById/findByEmail carry.
     */
    findStatusById(id: string): Promise<{
        status: UserRecord['status'];
    } | undefined>;
    setActiveRefreshTokenId(id: string, tokenId: string | null): Promise<void>;
    updateRole(id: string, role: (typeof userRoleEnum.enumValues)[number]): Promise<SafeUserRecord | undefined>;
    markEmailVerified(id: string): Promise<void>;
    create(data: CreateUserData): Promise<UserRecord>;
}
