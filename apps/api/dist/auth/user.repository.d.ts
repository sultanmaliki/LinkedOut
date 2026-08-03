export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}
export declare class UserRepository {
  private readonly users;
  findByEmail(email: string): Promise<UserRecord | undefined>;
  findById(id: string): Promise<UserRecord | undefined>;
  create(data: Omit<UserRecord, 'id'>): Promise<UserRecord>;
}
