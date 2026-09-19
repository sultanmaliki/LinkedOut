"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@linkedout/database");
class UserRepository {
    async findByEmail(email) {
        const [user] = await database_1.db
            .select({
            id: database_1.users.id,
            email: database_1.users.email,
            passwordHash: database_1.users.passwordHash,
            role: database_1.users.role,
            status: database_1.users.status,
            emailVerified: database_1.users.emailVerified,
            activeRefreshTokenId: database_1.users.activeRefreshTokenId,
            passwordResetTokenId: database_1.users.passwordResetTokenId,
            name: database_1.professionalProfiles.fullName,
        })
            .from(database_1.users)
            .leftJoin(database_1.professionalProfiles, (0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, database_1.users.id))
            .where((0, drizzle_orm_1.eq)(database_1.users.email, email))
            .limit(1);
        if (!user || user.name === null) {
            return undefined;
        }
        const { name } = user;
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            activeRefreshTokenId: user.activeRefreshTokenId,
            passwordResetTokenId: user.passwordResetTokenId,
            name,
        };
    }
    async findById(id) {
        const [user] = await database_1.db
            .select({
            id: database_1.users.id,
            email: database_1.users.email,
            passwordHash: database_1.users.passwordHash,
            role: database_1.users.role,
            status: database_1.users.status,
            emailVerified: database_1.users.emailVerified,
            activeRefreshTokenId: database_1.users.activeRefreshTokenId,
            passwordResetTokenId: database_1.users.passwordResetTokenId,
            name: database_1.professionalProfiles.fullName,
        })
            .from(database_1.users)
            .leftJoin(database_1.professionalProfiles, (0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, database_1.users.id))
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .limit(1);
        if (!user || user.name === null) {
            return undefined;
        }
        const { name } = user;
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            activeRefreshTokenId: user.activeRefreshTokenId,
            passwordResetTokenId: user.passwordResetTokenId,
            name,
        };
    }
    /**
     * Lightweight status lookup used by AuthGuard on every authenticated
     * request. Deliberately avoids the professionalProfiles join and
     * passwordHash column that findById/findByEmail carry.
     */
    async findStatusById(id) {
        const [user] = await database_1.db
            .select({ status: database_1.users.status, emailVerified: database_1.users.emailVerified })
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .limit(1);
        return user;
    }
    async setActiveRefreshTokenId(id, tokenId) {
        await database_1.db
            .update(database_1.users)
            .set({ activeRefreshTokenId: tokenId, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
    async updateRole(id, role) {
        const [user] = await database_1.db
            .update(database_1.users)
            .set({ role, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .returning({
            id: database_1.users.id,
            email: database_1.users.email,
            role: database_1.users.role,
            status: database_1.users.status,
        });
        return user;
    }
    async markEmailVerified(id) {
        await database_1.db
            .update(database_1.users)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
    async setPasswordResetTokenId(id, tokenId) {
        await database_1.db
            .update(database_1.users)
            .set({ passwordResetTokenId: tokenId, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
    // Also clears passwordResetTokenId, whether or not a reset was actually
    // in flight -- a password change through any path invalidates any
    // outstanding reset link for the account, since the old link's whole
    // purpose (setting a new password) has already been achieved.
    async updatePassword(id, passwordHash) {
        await database_1.db
            .update(database_1.users)
            .set({ passwordHash, passwordResetTokenId: null, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
    async create(data) {
        return database_1.db.transaction(async (tx) => {
            const [user] = await tx
                .insert(database_1.users)
                .values({
                email: data.email,
                passwordHash: data.passwordHash,
                role: 'PROFESSIONAL',
                emailVerified: false,
                status: 'ACTIVE',
            })
                .returning({
                id: database_1.users.id,
                email: database_1.users.email,
                passwordHash: database_1.users.passwordHash,
                role: database_1.users.role,
                status: database_1.users.status,
                emailVerified: database_1.users.emailVerified,
                activeRefreshTokenId: database_1.users.activeRefreshTokenId,
                passwordResetTokenId: database_1.users.passwordResetTokenId,
            });
            if (!user) {
                throw new Error('Failed to create user');
            }
            const [profile] = await tx
                .insert(database_1.professionalProfiles)
                .values({
                userId: user.id,
                fullName: data.name,
            })
                .returning({
                fullName: database_1.professionalProfiles.fullName,
            });
            if (!profile) {
                throw new Error('Failed to create professional profile');
            }
            return {
                ...user,
                name: profile.fullName,
            };
        });
    }
}
exports.UserRepository = UserRepository;
