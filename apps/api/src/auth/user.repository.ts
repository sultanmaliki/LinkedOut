export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}

export class UserRepository {
  private readonly users: UserRecord[] = [];

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async create(data: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const user: UserRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...data,
    };
    this.users.push(user);
    return user;
  }
}
