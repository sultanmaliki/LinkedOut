import { eq } from 'drizzle-orm';

import { db, professionalProfiles, users, type userRoleEnum } from '@linkedout/database';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BANNED';
  emailVerified: boolean;
  activeRefreshTokenId: string | null;
  passwordResetTokenId: string | null;
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

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        activeRefreshTokenId: users.activeRefreshTokenId,
        passwordResetTokenId: users.passwordResetTokenId,
        name: professionalProfiles.fullName,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(professionalProfiles.userId, users.id))
      .where(eq(users.email, email))
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

  async findById(id: string): Promise<UserRecord | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        activeRefreshTokenId: users.activeRefreshTokenId,
        passwordResetTokenId: users.passwordResetTokenId,
        name: professionalProfiles.fullName,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(professionalProfiles.userId, users.id))
      .where(eq(users.id, id))
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
  async findStatusById(
    id: string,
  ): Promise<{ status: UserRecord['status']; emailVerified: boolean } | undefined> {
    const [user] = await db
      .select({ status: users.status, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  }

  async setActiveRefreshTokenId(id: string, tokenId: string | null): Promise<void> {
    await db
      .update(users)
      .set({ activeRefreshTokenId: tokenId, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateRole(
    id: string,
    role: (typeof userRoleEnum.enumValues)[number],
  ): Promise<SafeUserRecord | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
      });

    return user;
  }

  async markEmailVerified(id: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async setPasswordResetTokenId(id: string, tokenId: string | null): Promise<void> {
    await db
      .update(users)
      .set({ passwordResetTokenId: tokenId, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Also clears passwordResetTokenId, whether or not a reset was actually
  // in flight -- a password change through any path invalidates any
  // outstanding reset link for the account, since the old link's whole
  // purpose (setting a new password) has already been achieved.
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordHash, passwordResetTokenId: null, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    return db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: data.passwordHash,
          role: 'PROFESSIONAL',
          emailVerified: false,
          status: 'ACTIVE',
        })
        .returning({
          id: users.id,
          email: users.email,
          passwordHash: users.passwordHash,
          role: users.role,
          status: users.status,
          emailVerified: users.emailVerified,
          activeRefreshTokenId: users.activeRefreshTokenId,
          passwordResetTokenId: users.passwordResetTokenId,
        });

      if (!user) {
        throw new Error('Failed to create user');
      }

      const [profile] = await tx
        .insert(professionalProfiles)
        .values({
          userId: user.id,
          fullName: data.name,
        })
        .returning({
          fullName: professionalProfiles.fullName,
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
