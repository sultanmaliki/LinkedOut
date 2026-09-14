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
      name,
    };
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
