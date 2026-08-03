export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  createdAt: string;
  revokedAt?: string;
}
