'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserRepository = void 0;
const drizzle_orm_1 = require('drizzle-orm');
const database_1 = require('@linkedout/database');
class UserRepository {
  async findByEmail(email) {
    const [user] = await database_1.db
      .select({
        id: database_1.users.id,
        email: database_1.users.email,
        passwordHash: database_1.users.passwordHash,
        role: database_1.users.role,
        status: database_1.users.status,
        name: database_1.professionalProfiles.fullName,
      })
      .from(database_1.users)
      .leftJoin(
        database_1.professionalProfiles,
        (0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, database_1.users.id),
      )
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
        name: database_1.professionalProfiles.fullName,
      })
      .from(database_1.users)
      .leftJoin(
        database_1.professionalProfiles,
        (0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, database_1.users.id),
      )
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
      name,
    };
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
