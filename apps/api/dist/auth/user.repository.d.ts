export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
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
  create(data: CreateUserData): Promise<UserRecord>;
}
